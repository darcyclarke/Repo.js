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
    var _this   = this,
      keyStr64  = "ABCDEFGHIJKLMNOP" + "QRSTUVWXYZabcdef" + "ghijklmnopqrstuv" + "wxyz0123456789+/" + "=",
      encode64  = function(a){a=escape(a);var b="";var c,d,e="";var f,g,h,i="";var j=0;do{c=a.charCodeAt(j++);d=a.charCodeAt(j++);e=a.charCodeAt(j++);f=c>>2;g=(c&3)<<4|d>>4;h=(d&15)<<2|e>>6;i=e&63;if(isNaN(d)){h=i=64}else if(isNaN(e)){i=64}b=b+keyStr64.charAt(f)+keyStr64.charAt(g)+keyStr64.charAt(h)+keyStr64.charAt(i);c=d=e="";f=g=h=i=""}while(j<a.length);return b},
      decode64  = function(a){var b="";var c,d,e="";var f,g,h,i="";var j=0;var k=/[^A-Za-z0-9\+\/\=]/g;if(k.exec(a)){}a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{f=keyStr64.indexOf(a.charAt(j++));g=keyStr64.indexOf(a.charAt(j++));h=keyStr64.indexOf(a.charAt(j++));i=keyStr64.indexOf(a.charAt(j++));c=f<<2|g>>4;d=(g&15)<<4|h>>2;e=(h&3)<<6|i;b=b+String.fromCharCode(c);if(h!=64){b=b+String.fromCharCode(d)}if(i!=64){b=b+String.fromCharCode(e)}c=d=e="";f=g=h=i=""}while(j<a.length);return unescape(b)},
      transition  = function(el, direction, init){
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
        branch  : 'master',
        css   : '{{{ css }}}'
      }, options);

    // Extension Hashes
    _this.extensions = {
      as      : 'actionscript',
      coffee    : 'coffeescript',
      css     : 'css',
      html    : 'html',
      js      : 'javascript',
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

