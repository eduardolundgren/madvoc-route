'use strict';

var gulp = require('gulp');
var nodeunit = require('gulp-nodeunit');

gulp.task('test', function() {
  return gulp.src('test/*.js').pipe(nodeunit());
});

gulp.task('watch', function() {
  gulp.watch(['index.js', 'test/**/*'], ['test']);
});
