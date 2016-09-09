
import extend from 'lodash/defaultsDeep'

export default class {

  constructor (element, options = {}) {
    this.state(extend({}, options, defaults))
    this.render = {
      repo: (data) => {
        // Store number of files/folders
        let treeLength = data.tree.length
        // Iterate over files/folders
        data.tree.forEach( (obj, i) => {
          // Check if we've hit the last file/folder
          if (!--treeLength)
            return hideLoader()
          // Exit early if the data is not a file/folder
          if (obj.type != 'blob')
            return
          // Define key file/folder vars
          let path = obj.path
          let parts = path.split('/')
          let file = parts[(parts.length - 1)]
          // Remove file from array
          parts = parts.slice(0,-1)
        })
      },

      file: (data) => {
        let ext = data.name.split('.').pop().toLowerCase()
        let mime = getMimeTypeByExtension(ext)
        let type = mime.split('/').shift()
        if( type === 'image' ){
          let image = `<img src='data:${mime};base64,${data.content}'>`
        }
        // sanitize file contents
        let contents = String(decode64(data.content)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      }
    }
  }

  set state( options ) {
    this.options = extend( {}, options, parseURL( options.url ) )
  }

  get state() {
    return this
  }

  showLoader() {

  }

  hideLoader() {

  }

  goHome() {

  }

  goBack() {

  }

  goForward() {

  }

}