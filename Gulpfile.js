var gulp = require('gulp');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var handlebars = require('gulp-compile-handlebars');
var uglifycss = require('uglifycss');
var rimraf = require('gulp-rimraf');

var paths = {
  repo: 'src/repo.js',
  repo_tmp: '.tmp/repo.js',
  deps: 'src/dependencies/**/*.js',
  css: 'src/styles/repo.css'
};

gulp.task('css', function() {
  var templateData = {
    css: uglifycss.processFiles([paths.css])
  }

  return gulp.src(paths.repo)
    .pipe(handlebars(templateData))
    .pipe(concat(paths.repo_tmp))
    .pipe(gulp.dest('./'));
});

gulp.task('dist:dev', ['css'], function() {
  return gulp.src([paths.deps, paths.repo_tmp])
    .pipe(concat('repo.js'))
    .pipe(gulp.dest('./'))
});

gulp.task('dist:min', ['css'], function() {
  return gulp.src([paths.deps, paths.repo_tmp])
    .pipe(uglify({ preserveComments: 'some' }))
    .pipe(concat('repo.min.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('clean', ['dist:min'], function() {
  rimraf(paths.repo_tmp);
});

gulp.task('default', ['css', 'dist:dev', 'dist:min', 'clean']);
