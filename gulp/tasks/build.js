'use strict';

var gulp = require('gulp');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var pump = require('pump');

gulp.task('build', function (cb) {
  var pkg = require('../../package.json');

  pump([
    gulp.src('src/WebAudioPlayer.js'),

    // Create dist.
    replace('{{ version }}', pkg.version),
    gulp.dest('dist'),

    // Create minified version.
    uglify(),
    rename('WebAudioPlayer.min.js'),
    gulp.dest('dist')
  ], cb);
});
