// ----------------------------
// Requirements
// ----------------------------

'use strict'

import gulp from 'gulp'
import plugins from 'gulp-load-plugins'
import runSequence from 'run-sequence'
import browserify from 'browserify'
import babelify from 'babelify'
import buffer from 'buffer'
import server from 'repo-server'
import browserSync from 'browser-sync'
import pkg from './package'

// ----------------------------
// Config
// ----------------------------

const $ = plugins()
const bs = browserSync.create()
const prod = (argv.production)

// ----------------------------
// Paths
// ----------------------------

const src = './src/'
const dest = './dist/'
const paths = {
  scripts: {
    src: `${src}scripts/index.js`
    watch: `${src}{scripts,templates}/**/*.{js,hbs}`
  },
  styles: {
    src: `${src}scripts/main.styl`
    watch: `${src}styles/**/*`
  },
  templates: {
    src: `${src}templates/**/*.hbs`
  },
  themes: {
    src: `${src}themes/**/*`,
    dest: `${dest}themes/`,
    watch: `${src}themes/**/*`
  },
  examples: {
    src: `./examples/`
  }
}
const header = `
  /**
    * <%= pkg.name %> - <%= pkg.description %>',
    * @version v<%= pkg.version %>',
    * @link <%= pkg.homepage %>',
    * @license <%= pkg.license %>',
   */
  `

// ----------------------------
// Utils
// ----------------------------

const handleError = (err) => {
  console.error(colors.red(err))
}

// ----------------------------
// Clean Task
// ----------------------------

gulp.task('clean', () => {
  return gulp.src(dest).pipe($.rimraf())
})

// ----------------------------------
// Styles Task
// ----------------------------------

gulp.task('styles', () => {
  return gulp.src(paths.styles.src)
    .pipe($.sourcemaps.init())
    .pipe($.stylus({ use: [ nib() ] }))
    .on('error', handleError)
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream({ match: '**/*.css' }))
})

// ----------------------------
// Scripts Task
// ----------------------------

gulp.task('scripts', () => {
  let bundler = browserify(paths.scripts.src, { debug: true }).transform(babelify, {
    presets: ['es2015'],
    plugins: ['transform-runtime', 'transform-decorators-legacy']
  })
  let prod = (process.ENV !== 'production')
  return bundler.bundle()
    .on('error', handleError)
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe($.if(!prod, $.sourcemaps.init({ loadMaps: true })))
    .pipe($.if(prod, $.uglify()))
    .pipe($.if(!prod, $.sourcemaps.write('.')))
    .pipe($.header(header, { pkg: pkg }))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browserSync.stream({ match: '**/*.js' }))
})

// ----------------------------
// Build Task
// ----------------------------

gulp.task('build', () => {
  process.ENV = 'production'
  runSequence('clean', [ 'templates', 'styles', 'scripts' ])
})

// ----------------------------
// Watch Task
// ----------------------------

gulp.task('watch', () => {
  browserSync.init({ server: paths.examples.src, ui: false })
  gulp.watch(paths.templates.watch, [ 'templates' ])
  gulp.watch(paths.scripts.watch, [ 'scripts' ])
  gulp.watch(paths.styles.watch, [ 'styles' ])
})

// ----------------------------------
// Default Task
// ----------------------------------

gulp.task('default', () => {
  runSequence('clean', [ 'templates', 'styles', 'scripts', 'watch' ])
})
