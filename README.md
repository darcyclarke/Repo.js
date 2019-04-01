Repo.js
=======

[![Build Status](http://img.shields.io/travis/darcyclarke/Repo.js.svg?style=flat-square)](https://travis-ci.org/darcyclarke/Repo.js)
[![Dependency Status](https://david-dm.org/darcyclarke/repo.js/badges.svg?style=flat-square)](https://david-dm.org/darcyclarke/repo.js/badges)
[![devDependency Status](https://david-dm.org/darcyclarke/repo.js/badges/dev-status.svg?style=flat-square)](https://david-dm.org/darcyclarke/repo.js/badges#info=devDependencies)
[![Code Climate](http://img.shields.io/codeclimate/github/darcyclarke/Repo.js.svg?style=flat-square)](https://codeclimate.com/github/darcyclarke/Repo.js)
[![npm](https://img.shields.io/npm/v/repo.js.svg?maxAge=2592000&style=flat-square)](https://www.npmjs.com/package/repo.js)
[![npm](https://img.shields.io/npm/dt/repo.js.svg?maxAge=2592000&style=flat-square)](https://www.npmjs.com/package/repo.js)
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://darcyclarke.mit-license.org)

Repo.js is a jQuery plugin that lets you easily embed a Github repo onto your site. This is great for other plugin or library authors that want to showcase the contents of a repo on their project pages. 

Repo.js uses [Markus Ekwall](https://twitter.com/#!/mekwall)'s [jQuery Vangogh](https://github.com/mekwall/jquery-vangogh) plugin for styling of file contents. Vangogh, subsequently, utilizes [highlight.js](https://github.com/isagalaev/highlight.js), written by [Ivan Sagalaev](https://github.com/isagalaev) for syntax highlighting.

## Example Usage

```js
$('body').repo({ user: 'darcyclarke', name: 'Repo.js' })
```

You can also reference a specific branch if you want:

```js
$('body').repo({ user: 'jquery', name: 'jquery', branch: 'strip_iife' })
```

