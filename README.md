Repo.js
=======

Repo.js is a jQuery plugin that lets you easily embed a Github repo onto your site. This is great for other plugin or library authors that want to showcase the contents of a repo on their project pages. 

Repo.js uses [Markus Ekwall](https://twitter.com/#!/mekwall)'s [jQuery Vangogh](https://github.com/mekwall/jquery-vangogh) plugin for styling of file contents. Vangogh, subsequently, utilizes [highlight.js](https://github.com/isagalaev/highlight.js), written by [Ivan Sagalaev](https://github.com/isagalaev) for syntax highlighting.

##Demo

Check out the demo: http://darcyclarke.me/dev/repojs/

<img src="http://darcyclarke.me/dev/repojs/repo_screen.png">

##Example Use

```javascript
$('body').repo({ user: 'darcyclarke', name: 'Repo.js' });
````

You can also reference a specific branch if you want:

```javascript
$('body').repo({ user: 'jquery', name: 'jquery', branch: 'strip_iife' });
````

@author [Darcy Clarke](http://darcyclarke.me)
@version 1.0

##License

Copyright (c) 2012 Darcy Clarke <darcy@darcyclarke.me>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. 
