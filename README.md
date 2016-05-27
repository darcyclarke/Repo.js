


[![Build Status](http://img.shields.io/travis/darcyclarke/Repo.js.svg?style=flat-square)](https://travis-ci.org/darcyclarke/Repo.js)
[![Dependency Status](https://david-dm.org/darcyclarke/repo.js/badges.svg?style=flat-square)](https://david-dm.org/darcyclarke/repo.js/badges)
[![devDependency Status](https://david-dm.org/darcyclarke/repo.js/badges/dev-status.svg?style=flat-square)](https://david-dm.org/darcyclarke/repo.js/badges#info=devDependencies)
[![Code Climate](http://img.shields.io/codeclimate/github/darcyclarke/Repo.js.svg?style=flat-square)](https://codeclimate.com/github/darcyclarke/Repo.js)
[![npm](https://img.shields.io/npm/v/repo.js.svg?maxAge=2592000&style=flat-square)](https://www.npmjs.com/package/repo.js)
[![npm](https://img.shields.io/npm/dt/repo.js.svg?maxAge=2592000&style=flat-square)](https://www.npmjs.com/package/repo.js)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-green.svg?style=flat-square)](https://github.com/feross/standard)
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://darcyclarke.mit-license.org)
[![Join the chat at https://gitter.im/darcyclarke/Repo.js](http://img.shields.io/:Gitter-Join Chat-orange.svg?style=flat-square)](https://gitter.im/darcyclarke/Repo.js)

Repo.js
=======

Repo.js is a JavaScript library that lets you easily embed a Github repo onto your site. This is great for showcasing the contents of a repo on project pages, documentation etc..

##Example Usage

```html
<a href="https://github.com/darcyclarke/repo.js" class="repojs"></a>
````

```html
<script defer src="https://oss.maxcdn.com/repojs/2.0.1/repo.js"></script>
````

### Gists are automatically detected

```html
<a href="https://gist.github.com/darcyclarke/355aa8045c2cf9816a3b" class="repojs"></a>
````

### Options can be set with `data` attributes or via JavaScript

```html
<a href="https://github.com/darcyclarke/detect.js" class="repojs" data-type="user"></a>
````

```javascript
var element = document.querySelector( 'div' );
var buttons = new Repo( element, {
  url: 'https://github.com/darcyclarke/detect.js',
  type: 'buttons',
  display: {
    download: false,
    issue: false,
    watch: false
  }
});
````

## JavaScript API

#### Repos
Type: `Object`

This object holds references to all repositories that get instantiated along with some helpful APIs.

### Repos.onload
Type: `Function`

This function is fired after all repositories have been generated.

#### Repo
Type: `Function( element, options )`

### Options

#### url

Type: `String`
Default: `undefined`

#### type
Type: `String`
Default: `repo`

Values:
  - `repo` - renders a directory listing **or** gist (based on `url`)
  - `buttons` - renders relevant buttons (star, follow, fork etc.)
  - `user` - renders a social user card

This sets the default UI to be displayed.

#### display
Type: `Object`
Default: `{}`

Values:
  - `url` the repo, gist, user or org's link
  - `name` the repo, gist or user's name
  - `description` the repo, gist, user or org's description
  - `avatar` the user's or organization's avatar
  - `readme` the rendered readme markdown page for folders
  - `download` the download button
  - `fork` the fork button
  - `forkCount` the fork count inside the button
  - `star` the star button
  - `starCount` the star count inside the button
  - `issue` the issue button
  - `issueCount` the issue count inside the button
  - `watch` the watch button
  - `watchCount` the watch count inside the button
  - `raw` the raw button on file views
  - `blame` the blame button on file views
  - `history` the history button on file views

You can programatically show or hide specific UI features utilizing the `display` option. All display options are visible by default. **Note:** some options don't apply across the different types of layouts (ie. `repo` vs. `gist` vs. `social` vs. `file`).

#### Repo.onload
Type: `Function`

This function is after the individual repository has been generated.
