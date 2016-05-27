Repo.js
=======

[![Build Status](http://img.shields.io/travis/darcyclarke/Repo.js.svg?style=flat-square)](https://travis-ci.org/darcyclarke/Repo.js)
[![Dependency Status](https://david-dm.org/darcyclarke/repo.js/badges.svg?style=flat-square)](https://david-dm.org/darcyclarke/repo.js/badges)
[![devDependency Status](https://david-dm.org/darcyclarke/repo.js/badges/dev-status.svg?style=flat-square)](https://david-dm.org/darcyclarke/repo.js/badges#info=devDependencies)
[![Code Climate](http://img.shields.io/codeclimate/github/darcyclarke/Repo.js.svg?style=flat-square)](https://codeclimate.com/github/darcyclarke/Repo.js)
[![npm](https://img.shields.io/npm/v/repo.js.svg?maxAge=2592000&style=flat-square)](https://www.npmjs.com/package/repo.js)
[![npm](https://img.shields.io/npm/dt/repo.js.svg?maxAge=2592000&style=flat-square)](https://www.npmjs.com/package/repo.js)
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://darcyclarke.mit-license.org)
[![Join the chat at https://gitter.im/darcyclarke/Repo.js](http://img.shields.io/:Gitter-Join Chat-orange.svg?style=flat-square)](https://gitter.im/darcyclarke/Repo.js)

Repo.js is a jQuery plugin that lets you easily embed a Github repo onto your site. This is great for other plugin or library authors that want to showcase the contents of a repo on their project pages. 

Repo.js uses [Markus Ekwall](https://twitter.com/#!/mekwall)'s [jQuery Vangogh](https://github.com/mekwall/jquery-vangogh) plugin for styling of file contents. Vangogh, subsequently, utilizes [highlight.js](https://github.com/isagalaev/highlight.js), written by [Ivan Sagalaev](https://github.com/isagalaev) for syntax highlighting.

##Example Usage

```javascript
$('body').repo({ user: 'darcyclarke', name: 'Repo.js' });
````

You can also reference a specific branch if you want:

```javascript
$('body').repo({ user: 'jquery', name: 'jquery', branch: 'strip_iife' });
````

##License

Copyright (c) 2016 Darcy Clarke <darcy@darcyclarke.me>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
