'use strict';

var gulp = require('gulp');
var concat = require('gulp-concat');
var clone = require('gulp-clone');
var babel = require('gulp-babel');
var tributary = require('gulp-tributary');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('build', function () {
  var pkg = require('../../package.json');
  var templates = ['web_audio_player'];

  // Compile sources.
  var es6src = gulp.src([
    'src/utility.js',
    'src/event_target.js',
    'src/audio.js',
    'src/track.js',
    'src/web_audio_player.js'
  ])
    .pipe(concat('sources.js', {newLine: '\n'}));
  var src = es6src.pipe(clone())
    .pipe(babel({presets: ['es2015']}));

  templates.forEach(function (tplName) {
    var tplSrc = gulp.src('templates/' + tplName + '.js')
      .pipe(replace('{{ version }}', pkg.version));

    // Create ES6 dist.
    tplSrc.pipe(clone())
      .pipe(tributary(es6src))
      .pipe(rename(tplName + '.es6.js'))
      .pipe(gulp.dest('dist'));

    // Create compatible dist.
    tplSrc.pipe(tributary(src))
      .pipe(rename(tplName + '.js'))
      .pipe(gulp.dest('dist'))
      // Create minified version.
      .pipe(uglify())
      .pipe(rename(tplName + '.min.js'))
      .pipe(gulp.dest('dist'));
  });
});
