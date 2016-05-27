
// ----------------------------
// Requirements
// ----------------------------

var gulp = require('gulp')
var plugins = require('gulp-load-plugins')

// ----------------------------
// Paths
// ----------------------------

var paths = {
  source: {
    libs: [],
    templates: './src/templates/**/*.hbs',
    scripts: './src/scripts/index.js',
    styles: './src/styles/index.js'
  },
  build: {
    themes: './dist/themes/',
    styles: './dist/repo.css',
    scripts: './dist/repo.js'
  }
}

// ----------------------------
// Clean Task
// ----------------------------

gulp.task( 'clean', function () {

})

// ----------------------------
// Build Task
// ----------------------------

gulp.task( 'build', function () {

})
