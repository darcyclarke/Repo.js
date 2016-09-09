
const keyStr64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='

$( selector = required() ) {
  return Array.prototype.slice.call(document.querySelectorAll(selector))
}

required() {
  throw new Error('Missing parameter')
}

encode64( a = required() ) { a=escape(a);var b="";var c,d,e="";var f,g,h,i="";var j=0;do{c=a.charCodeAt(j++);d=a.charCodeAt(j++);e=a.charCodeAt(j++);f=c>>2;g=(c&3)<<4|d>>4;h=(d&15)<<2|e>>6;i=e&63;if(isNaN(d)){h=i=64}else if(isNaN(e)){i=64}b=b+keyStr64.charAt(f)+keyStr64.charAt(g)+keyStr64.charAt(h)+keyStr64.charAt(i);c=d=e="";f=g=h=i=""}while(j<a.length);return b }

decode64( a = required() ) { var b="";var c,d,e="";var f,g,h,i="";var j=0;var k=/[^A-Za-z0-9\+\/\=]/g;if(k.exec(a)){}a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");do{f=keyStr64.indexOf(a.charAt(j++));g=keyStr64.indexOf(a.charAt(j++));h=keyStr64.indexOf(a.charAt(j++));i=keyStr64.indexOf(a.charAt(j++));c=f<<2|g>>4;d=(g&15)<<4|h>>2;e=(h&3)<<6|i;b=b+String.fromCharCode(c);if(h!=64){b=b+String.fromCharCode(d)}if(i!=64){b=b+String.fromCharCode(e)}c=d=e="";f=g=h=i=""}while(j<a.length);return unescape(b) }

getMimeTypeByExtension( ext = required() ) {
  return mimeTypes[ ext ] || 'text/plain';
}

createHash( url = required() ) {
  return `p=${fragments.path}${parseURL( url ).link.pathname}`
}

parseHash() {
  let hash = window.location.hash
  let pathPos = ( hash.indexOf('p=') >= 0 )
  let linePos = ( hash.indexOf('|') >= 0 )
  let lines = ( linePos ) ? hash.substr( linePos + 1, hash.length ) : null
  let path = ( pathPos ) ? hash.substr( pathPos + 2, linePos || hash.length ) : null
  return { path: path, lines: lines }
}

parseURL( url = required() ) {
  let link = document.createElement('a')
  link.href = url.toLowerCase()
  let path = link.pathname.split('/')
  let parsed = {
    type: null,
    user: path[0] || null,
    name: path[1] || null,
    branch: null,
    path: null
    link: link
  }

  // Gist
  if ( link.hostname === 'gist.github.com' ) {
    parsed.type = 'gist'
    parsed.branch = path[2] || null
  }

  // User
  if ( path.length === 1 ) {
    parsed.type = 'user'
  }

  // Repo
  if ( link.hostname === 'github.com' && path.length >= 2 ) {
    parsed.type = 'repo'
    parsed.path = path.slice(3, path.length).join('/')

    // Folder
    if ( path[2] === 'tree' ) {
      parsed.branch = path[3] || null
    }

    // File
    if ( link.path[2] === 'blob' ) {
      parsed.type = 'file'
      parsed.branch = path[3] || null
    }
  }

  return parsed
}
