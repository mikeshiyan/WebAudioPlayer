'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var tributary = require('gulp-tributary');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var pump = require('pump');

gulp.task('build', function (cb) {
  var pkg = require('../../package.json');
  var src = gulp.src([
    'src/utility.js',
    'src/event_target.js',
    'src/audio.js',
    'src/track.js',
    'src/web_audio_player.js'
  ])
    .pipe(concat('classes.js', {newLine: '\n'}));

  pump([
    gulp.src('templates/WebAudioPlayer.js'),

    // Create dist.
    tributary(src),
    replace('{{ version }}', pkg.version),
    gulp.dest('dist'),

    // Create minified version.
    uglify(),
    rename('WebAudioPlayer.min.js'),
    gulp.dest('dist')
  ], cb);
});
