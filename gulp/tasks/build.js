'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var tributary = require('gulp-tributary');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('build', function () {
  var pkg = require('../../package.json');

  // Compile sources.
  var src = gulp.src([
    'src/utility.js',
    'src/event_target.js',
    'src/audio.js',
    'src/track.js',
    'src/web_audio_player.js'
  ])
    .pipe(concat('sources.js', {newLine: '\n'}))
    .pipe(babel({presets: ['es2015']}));

  gulp.src('templates/WebAudioPlayer.js')
    // Create dist.
    .pipe(tributary(src))
    .pipe(replace('{{ version }}', pkg.version))
    .pipe(gulp.dest('dist'))
    // Create minified version.
    .pipe(uglify())
    .pipe(rename('WebAudioPlayer.min.js'))
    .pipe(gulp.dest('dist'));
});
