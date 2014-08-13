var gulp = require('gulp');

var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

var paths = {
  repo: 'src/repo.js',
  deps: 'src/dependencies/**/*.js'
};

gulp.task('min', function() {
  return gulp.src([paths.deps, paths.repo])
    .pipe(uglify({ preserveComments: 'some' }))
    .pipe(concat('repo.min.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('default', ['min']);
