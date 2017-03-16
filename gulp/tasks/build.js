'use strict';

var gulp = require('gulp');
var replace = require('gulp-replace');
var pump = require('pump');

gulp.task('build', function (cb) {
  var pkg = require('../../package.json');

  pump([
    gulp.src('src/WebAudioPlayer.js'),
    replace('{{ version }}', pkg.version),
    gulp.dest('dist')
  ], cb);
});
