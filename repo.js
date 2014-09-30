/*!
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

/* http://prismjs.com/download.html?themes=prism&languages=markup+css+clike+javascript+php+coffeescript+scss+c+python+ruby+objectivec&plugins=line-numbers */
self = (typeof window !== 'undefined')
	? window   // if in browser
	: (
		(typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope)
		? self // if in worker
		: {}   // if in node js
	);

var Prism = (function(){

// Private helper vars
var lang = /\blang(?:uage)?-(?!\*)(\w+)\b/i;

var _ = self.Prism = {
	util: {
		encode: function (tokens) {
			if (tokens instanceof Token) {
				return new Token(tokens.type, _.util.encode(tokens.content));
			} else if (_.util.type(tokens) === 'Array') {
				return tokens.map(_.util.encode);
			} else {
				return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
			}
		},

		type: function (o) {
			return Object.prototype.toString.call(o).match(/\[object (\w+)\]/)[1];
		},

		// Deep clone a language definition (e.g. to extend it)
		clone: function (o) {
			var type = _.util.type(o);

			switch (type) {
				case 'Object':
					var clone = {};

					for (var key in o) {
						if (o.hasOwnProperty(key)) {
							clone[key] = _.util.clone(o[key]);
						}
					}

					return clone;

				case 'Array':
					return o.slice();
			}

			return o;
		}
	},

	languages: {
		extend: function (id, redef) {
			var lang = _.util.clone(_.languages[id]);

			for (var key in redef) {
				lang[key] = redef[key];
			}

			return lang;
		},

		// Insert a token before another token in a language literal
		insertBefore: function (inside, before, insert, root) {
			root = root || _.languages;
			var grammar = root[inside];
			var ret = {};

			for (var token in grammar) {

				if (grammar.hasOwnProperty(token)) {

					if (token == before) {

						for (var newToken in insert) {

							if (insert.hasOwnProperty(newToken)) {
								ret[newToken] = insert[newToken];
							}
						}
					}

					ret[token] = grammar[token];
				}
			}

			return root[inside] = ret;
		},

		// Traverse a language definition with Depth First Search
		DFS: function(o, callback) {
			for (var i in o) {
				callback.call(o, i, o[i]);

				if (_.util.type(o) === 'Object') {
					_.languages.DFS(o[i], callback);
				}
			}
		}
	},

	highlightAll: function(async, callback) {
		var elements = document.querySelectorAll('code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code');

		for (var i=0, element; element = elements[i++];) {
			_.highlightElement(element, async === true, callback);
		}
	},

	highlightElement: function(element, async, callback) {
		// Find language
		var language, grammar, parent = element;

		while (parent && !lang.test(parent.className)) {
			parent = parent.parentNode;
		}

		if (parent) {
			language = (parent.className.match(lang) || [,''])[1];
			grammar = _.languages[language];
		}

		if (!grammar) {
			return;
		}

		// Set language on the element, if not present
		element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

		// Set language on the parent, for styling
		parent = element.parentNode;

		if (/pre/i.test(parent.nodeName)) {
			parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
		}

		var code = element.textContent;

		if(!code) {
			return;
		}

		var env = {
			element: element,
			language: language,
			grammar: grammar,
			code: code
		};

		_.hooks.run('before-highlight', env);

		if (async && self.Worker) {
			var worker = new Worker(_.filename);

			worker.onmessage = function(evt) {
				env.highlightedCode = Token.stringify(JSON.parse(evt.data), language);

				_.hooks.run('before-insert', env);

				env.element.innerHTML = env.highlightedCode;

				callback && callback.call(env.element);
				_.hooks.run('after-highlight', env);
			};

			worker.postMessage(JSON.stringify({
				language: env.language,
				code: env.code
			}));
		}
		else {
			env.highlightedCode = _.highlight(env.code, env.grammar, env.language)

			_.hooks.run('before-insert', env);

			env.element.innerHTML = env.highlightedCode;

			callback && callback.call(element);

			_.hooks.run('after-highlight', env);
		}
	},

	highlight: function (text, grammar, language) {
		var tokens = _.tokenize(text, grammar);
		return Token.stringify(_.util.encode(tokens), language);
	},

	tokenize: function(text, grammar, language) {
		var Token = _.Token;

		var strarr = [text];

		var rest = grammar.rest;

		if (rest) {
			for (var token in rest) {
				grammar[token] = rest[token];
			}

			delete grammar.rest;
		}

		tokenloop: for (var token in grammar) {
			if(!grammar.hasOwnProperty(token) || !grammar[token]) {
				continue;
			}

			var patterns = grammar[token];
			patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

			for (var j = 0; j < patterns.length; ++j) {
				var pattern = patterns[j],
					inside = pattern.inside,
					lookbehind = !!pattern.lookbehind,
					lookbehindLength = 0;

				pattern = pattern.pattern || pattern;

				for (var i=0; i<strarr.length; i++) { // Don’t cache length as it changes during the loop

					var str = strarr[i];

					if (strarr.length > text.length) {
						// Something went terribly wrong, ABORT, ABORT!
						break tokenloop;
					}

					if (str instanceof Token) {
						continue;
					}

					pattern.lastIndex = 0;

					var match = pattern.exec(str);

					if (match) {
						if(lookbehind) {
							lookbehindLength = match[1].length;
						}

						var from = match.index - 1 + lookbehindLength,
							match = match[0].slice(lookbehindLength),
							len = match.length,
							to = from + len,
							before = str.slice(0, from + 1),
							after = str.slice(to + 1);

						var args = [i, 1];

						if (before) {
							args.push(before);
						}

						var wrapped = new Token(token, inside? _.tokenize(match, inside) : match);

						args.push(wrapped);

						if (after) {
							args.push(after);
						}

						Array.prototype.splice.apply(strarr, args);
					}
				}
			}
		}

		return strarr;
	},

	hooks: {
		all: {},

		add: function (name, callback) {
			var hooks = _.hooks.all;

			hooks[name] = hooks[name] || [];

			hooks[name].push(callback);
		},

		run: function (name, env) {
			var callbacks = _.hooks.all[name];

			if (!callbacks || !callbacks.length) {
				return;
			}

			for (var i=0, callback; callback = callbacks[i++];) {
				callback(env);
			}
		}
	}
};

var Token = _.Token = function(type, content) {
	this.type = type;
	this.content = content;
};

Token.stringify = function(o, language, parent) {
	if (typeof o == 'string') {
		return o;
	}

	if (Object.prototype.toString.call(o) == '[object Array]') {
		return o.map(function(element) {
			return Token.stringify(element, language, o);
		}).join('');
	}

	var env = {
		type: o.type,
		content: Token.stringify(o.content, language, parent),
		tag: 'span',
		classes: ['token', o.type],
		attributes: {},
		language: language,
		parent: parent
	};

	if (env.type == 'comment') {
		env.attributes['spellcheck'] = 'true';
	}

	_.hooks.run('wrap', env);

	var attributes = '';

	for (var name in env.attributes) {
		attributes += name + '="' + (env.attributes[name] || '') + '"';
	}

	return '<' + env.tag + ' class="' + env.classes.join(' ') + '" ' + attributes + '>' + env.content + '</' + env.tag + '>';

};

if (!self.document) {
	if (!self.addEventListener) {
		// in Node.js
		return self.Prism;
	}
 	// In worker
	self.addEventListener('message', function(evt) {
		var message = JSON.parse(evt.data),
		    lang = message.language,
		    code = message.code;

		self.postMessage(JSON.stringify(_.util.encode(_.tokenize(code, _.languages[lang]))));
		self.close();
	}, false);

	return self.Prism;
}

// Get current script and highlight
var script = document.getElementsByTagName('script');

script = script[script.length - 1];

if (script) {
	_.filename = script.src;

	if (document.addEventListener && !script.hasAttribute('data-manual')) {
		document.addEventListener('DOMContentLoaded', _.highlightAll);
	}
}

return self.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}
;
Prism.languages.markup = {
	'comment': /<!--[\w\W]*?-->/g,
	'prolog': /<\?.+?\?>/,
	'doctype': /<!DOCTYPE.+?>/,
	'cdata': /<!\[CDATA\[[\w\W]*?]]>/i,
	'tag': {
		pattern: /<\/?[\w:-]+\s*(?:\s+[\w:-]+(?:=(?:("|')(\\?[\w\W])*?\1|[^\s'">=]+))?\s*)*\/?>/gi,
		inside: {
			'tag': {
				pattern: /^<\/?[\w:-]+/i,
				inside: {
					'punctuation': /^<\/?/,
					'namespace': /^[\w-]+?:/
				}
			},
			'attr-value': {
				pattern: /=(?:('|")[\w\W]*?(\1)|[^\s>]+)/gi,
				inside: {
					'punctuation': /=|>|"/g
				}
			},
			'punctuation': /\/?>/g,
			'attr-name': {
				pattern: /[\w:-]+/g,
				inside: {
					'namespace': /^[\w-]+?:/
				}
			}

		}
	},
	'entity': /\&#?[\da-z]{1,8};/gi
};

// Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {

	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});
;
Prism.languages.css = {
	'comment': /\/\*[\w\W]*?\*\//g,
	'atrule': {
		pattern: /@[\w-]+?.*?(;|(?=\s*{))/gi,
		inside: {
			'punctuation': /[;:]/g
		}
	},
	'url': /url\((["']?).*?\1\)/gi,
	'selector': /[^\{\}\s][^\{\};]*(?=\s*\{)/g,
	'property': /(\b|\B)[\w-]+(?=\s*:)/ig,
	'string': /("|')(\\?.)*?\1/g,
	'important': /\B!important\b/gi,
	'punctuation': /[\{\};:]/g,
	'function': /[-a-z0-9]+(?=\()/ig
};

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /<style[\w\W]*?>[\w\W]*?<\/style>/ig,
			inside: {
				'tag': {
					pattern: /<style[\w\W]*?>|<\/style>/ig,
					inside: Prism.languages.markup.tag.inside
				},
				rest: Prism.languages.css
			}
		}
	});
};
Prism.languages.clike = {
	'comment': [
		{
			pattern: /(^|[^\\])\/\*[\w\W]*?\*\//g,
			lookbehind: true
		},
		{
			pattern: /(^|[^\\:])\/\/.*?(\r?\n|$)/g,
			lookbehind: true
		}
	],
	'string': /("|')(\\?.)*?\1/g,
	'class-name': {
		pattern: /((?:(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[a-z0-9_\.\\]+/ig,
		lookbehind: true,
		inside: {
			punctuation: /(\.|\\)/
		}
	},
	'keyword': /\b(if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/g,
	'boolean': /\b(true|false)\b/g,
	'function': {
		pattern: /[a-z0-9_]+\(/ig,
		inside: {
			punctuation: /\(/
		}
	},
	'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?)\b/g,
	'operator': /[-+]{1,2}|!|<=?|>=?|={1,3}|&{1,2}|\|?\||\?|\*|\/|\~|\^|\%/g,
	'ignore': /&(lt|gt|amp);/gi,
	'punctuation': /[{}[\];(),.:]/g
};
;
Prism.languages.javascript = Prism.languages.extend('clike', {
	'keyword': /\b(break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|false|finally|for|function|get|if|implements|import|in|instanceof|interface|let|new|null|package|private|protected|public|return|set|static|super|switch|this|throw|true|try|typeof|var|void|while|with|yield)\b/g,
	'number': /\b-?(0x[\dA-Fa-f]+|\d*\.?\d+([Ee]-?\d+)?|NaN|-?Infinity)\b/g
});

Prism.languages.insertBefore('javascript', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
		lookbehind: true
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /<script[\w\W]*?>[\w\W]*?<\/script>/ig,
			inside: {
				'tag': {
					pattern: /<script[\w\W]*?>|<\/script>/ig,
					inside: Prism.languages.markup.tag.inside
				},
				rest: Prism.languages.javascript
			}
		}
	});
}
;
/**
 * Original by Aaron Harun: http://aahacreative.com/2012/07/31/php-syntax-highlighting-prism/
 * Modified by Miles Johnson: http://milesj.me
 *
 * Supports the following:
 * 		- Extends clike syntax
 * 		- Support for PHP 5.3+ (namespaces, traits, generators, etc)
 * 		- Smarter constant and function matching
 *
 * Adds the following new token classes:
 * 		constant, delimiter, variable, function, package
 */

Prism.languages.php = Prism.languages.extend('clike', {
	'keyword': /\b(and|or|xor|array|as|break|case|cfunction|class|const|continue|declare|default|die|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|for|foreach|function|include|include_once|global|if|new|return|static|switch|use|require|require_once|var|while|abstract|interface|public|implements|private|protected|parent|throw|null|echo|print|trait|namespace|final|yield|goto|instanceof|finally|try|catch)\b/ig,
	'constant': /\b[A-Z0-9_]{2,}\b/g,
	'comment': {
		pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|(^|[^:])(\/\/|#).*?(\r?\n|$))/g,
		lookbehind: true
	}
});

Prism.languages.insertBefore('php', 'keyword', {
	'delimiter': /(\?>|<\?php|<\?)/ig,
	'variable': /(\$\w+)\b/ig,
	'package': {
		pattern: /(\\|namespace\s+|use\s+)[\w\\]+/g,
		lookbehind: true,
		inside: {
			punctuation: /\\/
		}
	}
});

// Must be defined after the function pattern
Prism.languages.insertBefore('php', 'operator', {
	'property': {
		pattern: /(->)[\w]+/g,
		lookbehind: true
	}
});

// Add HTML support of the markup language exists
if (Prism.languages.markup) {

	// Tokenize all inline PHP blocks that are wrapped in <?php ?>
	// This allows for easy PHP + markup highlighting
	Prism.hooks.add('before-highlight', function(env) {
		if (env.language !== 'php') {
			return;
		}

		env.tokenStack = [];

		env.backupCode = env.code;
		env.code = env.code.replace(/(?:<\?php|<\?)[\w\W]*?(?:\?>)/ig, function(match) {
			env.tokenStack.push(match);

			return '{{{PHP' + env.tokenStack.length + '}}}';
		});
	});

	// Restore env.code for other plugins (e.g. line-numbers)
	Prism.hooks.add('before-insert', function(env) {
		if (env.language === 'php') {
			env.code = env.backupCode;
			delete env.backupCode;
		}
	});

	// Re-insert the tokens after highlighting
	Prism.hooks.add('after-highlight', function(env) {
		if (env.language !== 'php') {
			return;
		}

		for (var i = 0, t; t = env.tokenStack[i]; i++) {
			env.highlightedCode = env.highlightedCode.replace('{{{PHP' + (i + 1) + '}}}', Prism.highlight(t, env.grammar, 'php'));
		}

		env.element.innerHTML = env.highlightedCode;
	});

	// Wrap tokens in classes that are missing them
	Prism.hooks.add('wrap', function(env) {
		if (env.language === 'php' && env.type === 'markup') {
			env.content = env.content.replace(/(\{\{\{PHP[0-9]+\}\}\})/g, "<span class=\"token php\">$1</span>");
		}
	});

	// Add the rules before all others
	Prism.languages.insertBefore('php', 'comment', {
		'markup': {
			pattern: /<[^?]\/?(.*?)>/g,
			inside: Prism.languages.markup
		},
		'php': /\{\{\{PHP[0-9]+\}\}\}/g
	});
}
;
Prism.languages.coffeescript = Prism.languages.extend('javascript', {
	'comment': [
		/([#]{3}\s*\r?\n(.*\s*\r*\n*)\s*?\r?\n[#]{3})/g,
		/(\s|^)([#]{1}[^#^\r^\n]{2,}?(\r?\n|$))/g
	],
	'keyword': /\b(this|window|delete|class|extends|namespace|extend|ar|let|if|else|while|do|for|each|of|return|in|instanceof|new|with|typeof|try|catch|finally|null|undefined|break|continue)\b/g
});

Prism.languages.insertBefore('coffeescript', 'keyword', {
	'function': {
		pattern: /[a-z|A-z]+\s*[:|=]\s*(\([.|a-z\s|,|:|{|}|\"|\'|=]*\))?\s*-&gt;/gi,
		inside: {
			'function-name': /[_?a-z-|A-Z-]+(\s*[:|=])| @[_?$?a-z-|A-Z-]+(\s*)| /g,
			'operator': /[-+]{1,2}|!|=?&lt;|=?&gt;|={1,2}|(&amp;){1,2}|\|?\||\?|\*|\//g
		}
	},
	'attr-name': /[_?a-z-|A-Z-]+(\s*:)| @[_?$?a-z-|A-Z-]+(\s*)| /g
});
;
Prism.languages.scss = Prism.languages.extend('css', {
	'comment': {
		pattern: /(^|[^\\])(\/\*[\w\W]*?\*\/|\/\/.*?(\r?\n|$))/g,
		lookbehind: true
	},
	// aturle is just the @***, not the entire rule (to highlight var & stuffs)
	// + add ability to highlight number & unit for media queries
	'atrule': /@[\w-]+(?=\s+(\(|\{|;))/gi,
	// url, compassified
	'url': /([-a-z]+-)*url(?=\()/gi,
	// CSS selector regex is not appropriate for Sass
	// since there can be lot more things (var, @ directive, nesting..)
	// a selector must start at the end of a property or after a brace (end of other rules or nesting)
	// it can contain some caracters that aren't used for defining rules or end of selector, & (parent selector), or interpolated variable
	// the end of a selector is found when there is no rules in it ( {} or {\s}) or if there is a property (because an interpolated var
	// can "pass" as a selector- e.g: proper#{$erty})
	// this one was ard to do, so please be careful if you edit this one :)
	'selector': /([^@;\{\}\(\)]?([^@;\{\}\(\)]|&|\#\{\$[-_\w]+\})+)(?=\s*\{(\}|\s|[^\}]+(:|\{)[^\}]+))/gm
});

Prism.languages.insertBefore('scss', 'atrule', {
	'keyword': /@(if|else if|else|for|each|while|import|extend|debug|warn|mixin|include|function|return|content)|(?=@for\s+\$[-_\w]+\s)+from/i
});

Prism.languages.insertBefore('scss', 'property', {
	// var and interpolated vars
	'variable': /((\$[-_\w]+)|(#\{\$[-_\w]+\}))/i
});

Prism.languages.insertBefore('scss', 'ignore', {
	'placeholder': /%[-_\w]+/i,
	'statement': /\B!(default|optional)\b/gi,
	'boolean': /\b(true|false)\b/g,
	'null': /\b(null)\b/g,
	'operator': /\s+([-+]{1,2}|={1,2}|!=|\|?\||\?|\*|\/|\%)\s+/g
});
;
Prism.languages.c = Prism.languages.extend('clike', {
	// allow for c multiline strings
	'string': /("|')([^\n\\\1]|\\.|\\\r*\n)*?\1/g,
	'keyword': /\b(asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while)\b/g,
	'operator': /[-+]{1,2}|!=?|<{1,2}=?|>{1,2}=?|\->|={1,2}|\^|~|%|&{1,2}|\|?\||\?|\*|\//g
});

Prism.languages.insertBefore('c', 'string', {
	// property class reused for macro statements
	'property': {
		// allow for multiline macro definitions
		// spaces after the # character compile fine with gcc
		pattern: /((^|\n)\s*)#\s*[a-z]+([^\n\\]|\\.|\\\r*\n)*/gi,
		lookbehind: true,
		inside: {
			// highlight the path of the include statement as a string
			'string': {
				pattern: /(#\s*include\s*)(<.+?>|("|')(\\?.)+?\3)/g,
				lookbehind: true,
			}
		}
	}
});

delete Prism.languages.c['class-name'];
delete Prism.languages.c['boolean'];;
Prism.languages.python= { 
	'comment': {
		pattern: /(^|[^\\])#.*?(\r?\n|$)/g,
		lookbehind: true
	},
	'string': /"""[\s\S]+?"""|("|')(\\?.)*?\1/g,
	'keyword' : /\b(as|assert|break|class|continue|def|del|elif|else|except|exec|finally|for|from|global|if|import|in|is|lambda|pass|print|raise|return|try|while|with|yield)\b/g,
	'boolean' : /\b(True|False)\b/g,
	'number' : /\b-?(0x)?\d*\.?[\da-f]+\b/g,
	'operator' : /[-+]{1,2}|=?&lt;|=?&gt;|!|={1,2}|(&){1,2}|(&amp;){1,2}|\|?\||\?|\*|\/|~|\^|%|\b(or|and|not)\b/g,
	'ignore' : /&(lt|gt|amp);/gi,
	'punctuation' : /[{}[\];(),.:]/g
};

;
/**
 * Original by Samuel Flores
 *
 * Adds the following new token classes:
 * 		constant, builtin, variable, symbol, regex
 */
Prism.languages.ruby = Prism.languages.extend('clike', {
	'comment': /#[^\r\n]*(\r?\n|$)/g,
	'keyword': /\b(alias|and|BEGIN|begin|break|case|class|def|define_method|defined|do|each|else|elsif|END|end|ensure|false|for|if|in|module|new|next|nil|not|or|raise|redo|require|rescue|retry|return|self|super|then|throw|true|undef|unless|until|when|while|yield)\b/g,
	'builtin': /\b(Array|Bignum|Binding|Class|Continuation|Dir|Exception|FalseClass|File|Stat|File|Fixnum|Fload|Hash|Integer|IO|MatchData|Method|Module|NilClass|Numeric|Object|Proc|Range|Regexp|String|Struct|TMS|Symbol|ThreadGroup|Thread|Time|TrueClass)\b/,
	'constant': /\b[A-Z][a-zA-Z_0-9]*[?!]?\b/g
});

Prism.languages.insertBefore('ruby', 'keyword', {
	'regex': {
		pattern: /(^|[^/])\/(?!\/)(\[.+?]|\\.|[^/\r\n])+\/[gim]{0,3}(?=\s*($|[\r\n,.;})]))/g,
		lookbehind: true
	},
	'variable': /[@$]+\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g,
	'symbol': /:\b[a-zA-Z_][a-zA-Z_0-9]*[?!]?\b/g
});
;
Prism.languages.objectivec = Prism.languages.extend('c', {
	'keyword': /(\b(asm|typeof|inline|auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|in|self|super)\b)|((?=[\w|@])(@interface|@end|@implementation|@protocol|@class|@public|@protected|@private|@property|@try|@catch|@finally|@throw|@synthesize|@dynamic|@selector)\b)/g,
	'string': /(?:("|')([^\n\\\1]|\\.|\\\r*\n)*?\1)|(@"([^\n\\"]|\\.|\\\r*\n)*?")/g,
	'operator': /[-+]{1,2}|!=?|<{1,2}=?|>{1,2}=?|\->|={1,2}|\^|~|%|&{1,2}|\|?\||\?|\*|\/|@/g
});
;
Prism.hooks.add('after-highlight', function (env) {
	// works only for <code> wrapped inside <pre data-line-numbers> (not inline)
	var pre = env.element.parentNode;
	if (!pre || !/pre/i.test(pre.nodeName) || pre.className.indexOf('line-numbers') === -1) {
		return;
	}

	var linesNum = (1 + env.code.split('\n').length);
	var lineNumbersWrapper;

	lines = new Array(linesNum);
	lines = lines.join('<span></span>');

	lineNumbersWrapper = document.createElement('span');
	lineNumbersWrapper.className = 'line-numbers-rows';
	lineNumbersWrapper.innerHTML = lines;

	if (pre.hasAttribute('data-start')) {
		pre.style.counterReset = 'linenumber ' + (parseInt(pre.getAttribute('data-start'), 10) - 1);
	}

	env.element.appendChild(lineNumbersWrapper);

});;

/*!
 * Repo.js
 * @author Darcy Clarke
 *
 * Copyright (c) 2012 Darcy Clarke
 * Dual licensed under the MIT and GPL licenses.
 * http://darcyclarke.me/
 */
(function($){

  // Github repo
  $.fn.repo = function( options ){

    // Context and Base64 methods
    var _this   = this;
    var keyStr64  = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv" + "wxyz0123456789+/" + "=";
    var encode64  = function(a){a=escape(a);var b="";var c,d,e="";var f,g,h,i="";var j=0;do{c=a.charCodeAt(j++);d=a.charCodeAt(j++);e=a.charCodeAt(j++);f=c>>2;g=(c&3)<<4|d>>4;h=(d&15)<<2|e>>6;i=e&63;if(isNaN(d)){h=i=64}else if(isNaN(e)){i=64}b=b+keyStr64.charAt(f)+keyStr64.charAt(g)+keyStr64.charAt(h)+keyStr64.charAt(i);c=d=e="";f=g=h=i=""}while(j<a.length);return b};
    var decode64  = function(a){var b="";var c,d,e="";var f,g,h,i="";var j=0;var k=/[^A-Za-z0-9\+\/\=]/g;if(k.exec(a)){}a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{f=keyStr64.indexOf(a.charAt(j++));g=keyStr64.indexOf(a.charAt(j++));h=keyStr64.indexOf(a.charAt(j++));i=keyStr64.indexOf(a.charAt(j++));c=f<<2|g>>4;d=(g&15)<<4|h>>2;e=(h&3)<<6|i;b=b+String.fromCharCode(c);if(h!=64){b=b+String.fromCharCode(d)}if(i!=64){b=b+String.fromCharCode(e)}c=d=e="";f=g=h=i=""}while(j<a.length);return unescape(b)};

    var transition  = function(el, direction, init) {
      var opposite  = (direction === 'left') ? '' : 'left';

      if(init){
        el.addClass('active');
        _this.container.css({'height' : calculateHeight(el) + 'px'});
      } else {
        _this.container
          .find('.page.active')
          .css('position','absolute')
          .addClass(direction)
          .removeClass('active')
          .end()
          .css({'height' : calculateHeight(el) + 'px'});
        el.addClass('active')
          .removeClass(opposite)
          .delay(250)
          .queue(function(){
            $(this).css('position','relative').dequeue();
          });
      }
    },

    calculateHeight = function(el){
      // This calculates the height of the bounding box for the repo display.
      // clientHeight is element containing fetched results, plus the h1 tag, plus
      // the div repo margin has of 15 pixels.
      return (el[0].clientHeight + _this.container.find('h1').outerHeight(true) + 15);
    },

    getMimeTypeByExtension = function(extension){
      var mimeTypes = {
        // images
        'png': 'image/png',
        'gif': 'image/gif',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'ico': 'image/x-icon'
      };
      return mimeTypes[extension] ? mimeTypes[extension] : 'text/plain';
    };

    // Settings
    _this.settings = $.extend({
      user  : '',
      name  : '',
      branch: 'master',
      file  : false,
      css   : 'code[class*="language-"],pre[class*="language-"]{color:black;text-shadow:0 1px white;direction:ltr;text-align:left;white-space:pre;word-spacing:normal;word-break:normal;line-height:1.5;font-family:Consolas,"Liberation Mono",Menlo,Courier,monospace;font-size:12px;-moz-tab-size:4;-o-tab-size:4;tab-size:4;-webkit-hyphens:none;-moz-hyphens:none;-ms-hyphens:none;hyphens:none}pre[class*="language-"]::-moz-selection,pre[class*="language-"] ::-moz-selection,code[class*="language-"]::-moz-selection,code[class*="language-"] ::-moz-selection{text-shadow:none;background:#b3d4fc}pre[class*="language-"]::selection,pre[class*="language-"] ::selection,code[class*="language-"]::selection,code[class*="language-"] ::selection{text-shadow:none;background:#b3d4fc}@media print{code[class*="language-"],pre[class*="language-"]{text-shadow:none}}pre[class*="language-"]{padding:.5em 1em;margin:.5em 0;overflow:hidden;overflow-x:auto;margin:0}:not(pre)>code[class*="language-"],pre[class*="language-"]{background:#fff}:not(pre)>code[class*="language-"]{padding:.1em;border-radius:.3em}.token.comment,.token.prolog,.token.doctype,.token.cdata{color:#998;font-style:italic}.token.punctuation{color:#999}.namespace{opacity:.7}.token.property,.token.tag,.token.boolean,.token.number,.token.constant,.token.symbol{color:#905}.token.selector,.token.attr-name,.token.string,.token.char,.token.builtin{color:#690}.token.operator,.token.entity,.token.url,.language-css .token.string,.style .token.string,.token.variable{color:#a67f59;background:hsla(0,0,100%,.5)}.token.atrule,.token.attr-value,.token.keyword{color:#07a}.token.function{color:#dd4a68}.token.regex,.token.important{color:#e90}.token.important{font-weight:bold}.token.entity{cursor:help}pre.line-numbers{position:relative;padding-left:4.8em;counter-reset:linenumber}pre.line-numbers>code{position:relative}.line-numbers .line-numbers-rows{position:absolute;pointer-events:none;font-size:100%;left:-4.8em;width:4em;letter-spacing:-1px;border-right:1px solid #eee;padding-top:1em;top:-1em;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.line-numbers-rows>span{pointer-events:none;display:block;counter-increment:linenumber}.line-numbers-rows>span:before{content:counter(linenumber);color:#b7b7b7;display:block;padding-right:.8em;text-align:right}.repo,.repo *{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;-ms-box-sizing:border-box;box-sizing:border-box}.repo ul *{display:block;font-family:sans-serif;font-size:13px;line-height:18px}.repo{width:100%;margin:0 0 15px 0;position:relative;padding-bottom:1px;color:#555;overflow:hidden;height:300px;-webkit-transition:height .25s;-moz-transition:height .25s;-o-transition:height .25s;-ms-transition:height .25s;transition:height .25s}.repo .page{background:#f8f8f8;border:1px solid #ddd;border-radius:3px;-ms-filter:"alpha(opacity=0)";filter:alpha(opacity=0);opacity:0;left:100%;width:98%;position:absolute;-webkit-transition:all .25s;-moz-transition:all .25s;-o-transition:all .25s;-ms-transition:all .25s;transition:all .25s}.repo .page.active{left:1% !important;-ms-filter:"alpha(opacity=100)";filter:alpha(opacity=100);opacity:1;display:block}.repo .page.left{left:-100%}.repo .loader{position:absolute;display:block;width:100%;height:300px;top:0;left:0;background:url(data:image/gif;base64,R0lGODlhQABAALMIAOzu7PT29Ozq7PTy9Pz6/Pz+/OTm5OTi5P///wAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/wtYTVAgRGF0YVhNUDw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpBN0RGOTZFMEJFNDAxMUUxOThFRUU2MTc0Q0I1MERFRCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpBN0RGOTZFMUJFNDAxMUUxOThFRUU2MTc0Q0I1MERFRCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkE3REY5NkRFQkU0MDExRTE5OEVFRTYxNzRDQjUwREVEIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkE3REY5NkRGQkU0MDExRTE5OEVFRTYxNzRDQjUwREVEIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Af/+/fz7+vn49/b19PPy8fDv7u3s6+rp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) no-repeat center 50%}.repo.loaded .loader{display:none}.repo h1{padding:0 0 0 10px;font-family:sans-serif;font-size:20px;line-height:26px;color:#000;font-weight:normal}.repo h1 a:nth-of-type(1),.repo h1 a.active{font-weight:bold}.repo h1 a.active,.repo h1 a.active:active,.repo h1 a.active:visited,.repo h1 a.active:hover{color:#000}.repo h1 a,.repo h1 a:active,.repo h1 a:visited,.repo h1 a:hover{color:#4183c4;text-decoration:none}.repo h1 a:after{content:"/";color:#999;padding:0 5px;font-weight:normal}.repo h1 a:last-child:after{content:""}.repo .page,.repo ul{zoom:1}.repo .page:before,.repo .page:after,.repo ul:before,.repo ul:after{content:"";display:table}.repo .page:after,.repo ul:after{clear:both}.repo ul{margin:0;padding:0}.repo li{width:100%;margin:0;padding:0;float:left;border-bottom:1px solid #ddd;position:relative;white-space:nowrap}.repo li.titles{background:-webkit-linear-gradient(#fafafa,#eaeaea);background:-moz-linear-gradient(#fafafa,#eaeaea);background:-o-linear-gradient(#fafafa,#eaeaea);background:-ms-linear-gradient(#fafafa,#eaeaea);background:linear-gradient(#fafafa,#eaeaea);font-weight:bold;padding:10px 10px 8px 36px;text-shadow:0 1px 0 #fff}.repo li:before{content:"";background-image:url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNy4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iNTcuNDY3cHgiIGhlaWdodD0iNzcuNzQ5cHgiIHZpZXdCb3g9IjAgMCA1Ny40NjcgNzcuNzQ5IiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1Ny40NjcgNzcuNzQ5IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwYXRoIGZpbGw9IiM3Nzc3NzciIGQ9Ik00My44OTgsMEg0Ljc2N0MyLjE0LDAsMCwyLjE0MSwwLDQuNzY4djY4LjIxM2MwLDIuNjMsMi4xNCw0Ljc2OCw0Ljc2Nyw0Ljc2OGg0Ny45MzINCgljMi42MywwLDQuNzY4LTIuMTM4LDQuNzY4LTQuNzY4VjE0Ljc0M0w0My44OTgsMHogTTQ1LjAyMyw3LjEzNWw1Ljk0OCw2LjQ2M2gtNS45NDhWNy4xMzV6IE01My40NjMsNzIuOTgNCgljMCwwLjQyMS0wLjM0NCwwLjc2NS0wLjc2NSwwLjc2NUg0Ljc2N2MtMC40MjEsMC0wLjc2My0wLjM0NC0wLjc2My0wLjc2NVY0Ljc2OGMwLTAuNDIxLDAuMzQyLTAuNzYyLDAuNzYzLTAuNzYyaDM2LjI1MXYxMS41OTUNCgljMCwxLjEwNCwwLjg5OSwxLjk5OSwyLjAwMywxLjk5OWgxMC40NDJDNTMuNDYzLDE3LjYsNTMuNDYzLDcyLjk4LDUzLjQ2Myw3Mi45OHogTTExLjA2NywyMS4yOTVoMzRjMC44MjgsMCwxLjUsMC42NzIsMS41LDEuNQ0KCXMtMC42NzIsMS41LTEuNSwxLjVoLTM0Yy0wLjgyOCwwLTEuNS0wLjY3Mi0xLjUtMS41UzEwLjIzOSwyMS4yOTUsMTEuMDY3LDIxLjI5NXogTTQ2LjU2NywzMi44NzVjMCwwLjgyOC0wLjY3MiwxLjUtMS41LDEuNWgtMzQNCgljLTAuODI4LDAtMS41LTAuNjcyLTEuNS0xLjVzMC42NzItMS41LDEuNS0xLjVoMzRDNDUuODk1LDMxLjM3NSw0Ni41NjcsMzIuMDQ3LDQ2LjU2NywzMi44NzV6IE00Ni41NjcsNDIuNjI1DQoJYzAsMC44MjgtMC42NzIsMS41LTEuNSwxLjVoLTM0Yy0wLjgyOCwwLTEuNS0wLjY3Mi0xLjUtMS41czAuNjcyLTEuNSwxLjUtMS41aDM0QzQ1Ljg5NSw0MS4xMjUsNDYuNTY3LDQxLjc5Nyw0Ni41NjcsNDIuNjI1eg0KCSBNNDYuNTY3LDUyLjU0MWMwLDAuODI4LTAuNjcyLDEuNS0xLjUsMS41aC0zNGMtMC44MjgsMC0xLjUtMC42NzItMS41LTEuNXMwLjY3Mi0xLjUsMS41LTEuNWgzNA0KCUM0NS44OTUsNTEuMDQxLDQ2LjU2Nyw1MS43MTMsNDYuNTY3LDUyLjU0MXoiLz4NCjwvc3ZnPg0K");position:absolute;width:16px;height:16px;background-size:contain;background-repeat:no-repeat;left:8px;top:10px}.repo li.dir:before{background-image:url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNy4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4IiB2aWV3Qm94PSIwIDAgMzIgMzIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMyIDMyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnIGlkPSJpY29tb29uLWlnbm9yZSI+DQoJPGxpbmUgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjNDQ5RkRCIiB4MT0iMCIgeTE9IjAiIHgyPSIwIiB5Mj0iMCIvPg0KPC9nPg0KPHBhdGggZmlsbD0iIzgwQTZDRCIgZD0iTTAsMTBoMzJsLTIsMjBIMkwwLDEweiBNMjksNmwxLDJIMmwyLTRoMTFsMSwySDI5eiIvPg0KPC9zdmc+DQo=")}.repo li.titles:before,.repo li.back:before{background-image:none}.repo li:last-child{border:0;padding-bottom:none;margin:0}.repo li a,.repo li a:visited,.repo li a:active{color:#4183c4;width:100%;padding:10px 10px 8px 36px;display:block;text-decoration:none}.repo li a:hover{text-decoration:underline}.repo li span{display:inline-block}.repo li span:nth-of-type(1){width:30%}.repo li span:nth-of-type(2){width:20%}.repo li span:nth-of-type(3){width:40%}'
    }, options);

    // Extension Hashes
    _this.extensions = {
      coffee  : 'coffeescript',
      css     : 'css',
      scss    : 'css',
      html    : 'markup',
      js      : 'javascript',
      json    : 'javascript',
      md      : 'markdown',
      php     : 'php',
      py      : 'python',
      rb      : 'ruby'
    };

    // Repo
    _this.repo = {
      name    : 'default',
      folders   : [],
      files   : []
    };

    // Namespace - strip out characters that would have to be escaped to be used in selectors
    _this.namespace = _this.settings.name.toLowerCase().replace(/[^a-z0-9_-]/g, '');

    // Check if this namespace is already in use
    var usedNamespaces = $('[data-id^='+ _this.namespace +']');
    if(usedNamespaces.length){
      _this.namespace += String(usedNamespaces.length);
    }

    // Insert CSS
    if(typeof _this.settings.css != 'undefined' && _this.settings.css !== '' && $('#repojs_css').length <= 0)
      $('body').prepend($('<style id="repojs_css">').html(_this.settings.css));

    // Query Github Tree API
    $.ajax({
      url: 'https://api.github.com/repos/' + _this.settings.user + '/' + _this.settings.name + '/git/trees/' + _this.settings.branch + '?recursive=1',
      type: 'GET',
      data: {},
      dataType: 'jsonp',
      success: function(response){

        if(response.meta.status != 200) {
          _this.container.addClass('loaded').html('<div class="page active"><ul><li class="titles">API limit exceeded</li></ul></div>');
          return;
        }

        var treeLength = response.data.tree.length;
        $.each(response.data.tree, function(i){

          // Setup if last element
          if(!--treeLength){
            _this.container.addClass('loaded');
            // Add 10ms timeout here as some browsers require a bit of time before calculating height.
            setTimeout( function(){
              transition(_this.container.find('.page').first(), 'left', true);
            }, 10 );
          }

          // Return if data is not a file
          if(this.type != 'blob')
            return;

          // Setup defaults
          var first   = _this.container.find('.page').first()
            ctx     = _this.repo,
            output    = first,
            path    = this.path,
            arr     = path.split('/'),
            file    = arr[(arr.length - 1)],
            id      = '';

          // Remove file from array
          arr = arr.slice(0,-1);
          id = _this.namespace;

          // Loop through folders
          $.each(arr, function(i){

            var name  = String(this),
              index = 0,
              exists  = false;

            id = id + '_split_' + name.replace('.','_dot_');

            // Loop through folders and check names
            $.each(ctx.folders, function(i){
              if(this.name == name){
                index = i;
                exists = true;
              }
            });

            // Create folder if it doesn't exist
            if(!exists){

              // Append folder to DOM
              if(output !== first){
                output.find('ul li.back').after($('<li class="dir"><a href="#" data-id="' + id + '">' + name +'</a></li>'));
              } else {
                output.find('ul li').first().after($('<li class="dir"><a href="#" data-id="' + id + '">' + name +'</a></li>'));
              }

              // Add folder to repo object
              ctx.folders.push({
                name    : name,
                folders   : [],
                files   : [],
                element   : $('<div class="page" id="' + id + '"><ul><li class="titles"><span>name</span></li><li class="back"><a href="#">..</a></li></ul></page>').appendTo(_this.container)[0]
              });
              index = ctx.folders.length-1;

            }

            // Change context & output to the proper folder
            output = $(ctx.folders[index].element);
            ctx = ctx.folders[index];

          });

          // Append file to DOM
          output.find('ul').append($('<li class="file"><a href="#" data-path="' + path + '" data-id="' + id + '">' + file +'</a></li>'));

          // Add file to the repo object
          ctx.files.push(file);

        });

        // Bind to page links
        _this.container.on('click', 'a', function(e){

          e.preventDefault();

          var link    = $(this),
            parent    = link.parents('li'),
            page    = link.parents('.page'),
            repo    = link.parents('.repo'),
            el      = $('#' + link.data('id'));

          // Is link a file
          if(parent.hasClass('file')){

            el = $('#' + link.data('id'));

            if(el.legnth > 0){
              el.addClass('active');
            } else {
              $.ajax({
                url: 'https://api.github.com/repos/' + _this.settings.user + '/' + _this.settings.name + '/contents/' + link.data('path') + '?ref=' + _this.settings.branch,
                type: 'GET',
                data: {},
                dataType: 'jsonp',
                success: function(response){
                  var fileContainer = $('<div class="file page" id="' + link.data('id') + '"></div>'),
                    extension = response.data.name.split('.').pop().toLowerCase(),
                    mimeType = getMimeTypeByExtension(extension);

                  if('image' === mimeType.split('/').shift()){
                    el = fileContainer.append($('<div class="image"><span class="border-wrap"><img src="" /></span></div>')).appendTo(repo);
                    el.find('img')
                      .attr('src', 'data:' + mimeType + ';base64,' + response.data.content)
                      .attr('alt', response.data.name);
                  }
                  else {
                    el = fileContainer.append($('<pre><code></code></pre>')).appendTo(repo);
                    if(typeof _this.extensions[extension] != 'undefined')
                      el.find('pre').addClass('line-numbers language-' + _this.extensions[extension]);
                      el.find('code').addClass('language-' + _this.extensions[extension]);
                    el.find('code').html(String(decode64(response.data.content)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
                    Prism.highlightAll();
                  }

                  transition(el, 'left');
                },
                error: function(response){
                  if(console && console.log)
                    console.log('Request Error:', e);
                }
              });
            }

          // Is link a folder
          } else if(parent.hasClass('dir')) {

            _this.container
              .find('h1')
              .find('.active')
              .removeClass('active')
              .end()
              .append('<a href="#" data-id="' + link.data('id') + '" class="active">' + link.text() + '</a>');
            transition(el, 'left');

          // Is link a back link
          } else if(parent.hasClass('back')){

            _this.container.find('h1 a').last().remove();
            el = page[0].id.split('_split_').slice(0,-1).join('_split_');
            el = (el == _this.namespace) ? _this.container.find('.page').first() : $('#' + el);
            transition(el, 'right');

          // Is nav link
          } else {
            el = el.length ? el : _this.container.find('.page').eq(link.index());

            if(link[0] !== _this.container.find('h1 a')[0])
              link.addClass('active');
            _this.container.find('h1 a').slice((link.index()+1),_this.container.find('h1 a').length).remove();
            transition(el, 'right');
          }
        });
      },
      error : function(response){
        if(console && console.log)
          console.log('Request Error:', response);
      }
    });

    // Setup repo container
    return this.each(function(){
      _this.container = $('<div class="repo"><h1><a href="#" data-id="' + _this.namespace + '_split_default">' + _this.settings.name + '</a></h1><div class="loader"></div><div class="page" id="' + _this.namespace + '_split_default"><ul><li class="titles"><span>name</span></li></ul></div></div>').appendTo($(this));
    });
  };

})(jQuery);
