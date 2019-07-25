Repo.js
=======

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

