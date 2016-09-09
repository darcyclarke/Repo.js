
// TODO: write Heroku node server to cache responses
// TODO: add service worker support/caching (polyfill?)
// deeplinking... oh yea
// truncation/memory loss 1,000 files
// offline/error messages
//

'use strict'

{

  // Imports
  import name, version from './package'
  import 'utils'
  import 'templates'
  import 'localforage'
  import 'whatwg-fetch'
  import instance from 'instance'
  import extend from 'lodash/defaultsDeep'

  // Global configuration options
  let defaults = {}

  // Keep track of registered instances, configurations & stores
  let instances = []

  // Create or reference local storage
  let store = localforage.config({
    name: name,
    version: version,
    size: 4980736
  })

  // API
  const api = 'https://api.github.com/'

  // API Endpoints
  let endpoints = {
    user: (_) => `${api}users/${_.user}`,
    gist: (_) => `${api}gists/${_.user}/${_.name}`,
    repo: (_) => `${api}repos/${_.user}/${_.name}/git/trees/${_.branch}?recursive=1`,
    file: (_) => `${api}repos/${_.user}/${_.name}/contents/${_.path}?ref=${_.branch}`
  }

  // Extensions
  const extensions = {
    coffee: 'coffeescript',
    css: 'css',
    scss: 'css',
    html: 'markup',
    js: 'javascript',
    json: 'javascript',
    md: 'markdown',
    php: 'php',
    py: 'python',
    rb: 'ruby'
  }

  const mimeTypes = {
    png: 'image/png',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    ico: 'image/x-icon'
  }

  const fetchOptions = {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }

  // Register a new user, repo, branch or gist
  register( element, options ) {
    instances.push(new Instance(element, options))
  }

  // Request data locally or from the caching server
  request( options ) {

    // Set this up so that it only runs once if multiple
    let url = endpoints[options.type](options)

    // check cache
    // render
    instances[i](data)

    // expire cache
    // fire fetch request

    fetch( url, fetchOptions ).then( handle(url) ).catch( (error) => {
      console.log( 'request failed', error )
    })

  }

  // Handle responses
  handle( url ) {

    return (response) => {

      // Get current time
      let timestamp = new Date() * 1000

      // TODO: check response for errors

      // look in instances for every match of this url
      // loop over instances and render
      instances.filter((obj) => {
        obj.type
      })
      instances[i](data)

    }
  }
}
