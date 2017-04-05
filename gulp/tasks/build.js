'use strict';

var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var clone = require('gulp-clone');
var babel = require('gulp-babel');
var tributary = require('gulp-tributary');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var jsdoc2md = require('gulp-jsdoc-to-markdown');

gulp.task('build', function () {
  del(['dist']);

  var pkg = require('../../package.json');
  var templates = [pkg.name, 'common'];

  // Compile sources.
  var es6src = gulp.src([
    'src/utility.js',
    'src/event_target.js',
    'src/audio.js',
    'src/track.js',
    'src/playlist.js',
    'src/web_audio_player.js'
  ])
    .pipe(concat('sources.js', {newLine: '\n'}));
  var src = es6src.pipe(clone())
    .pipe(babel({presets: ['es2015']}));

  templates.forEach(function (tplName) {
    var tplSrc = gulp.src('templates/' + tplName + '.js')
      .pipe(replace('{{ description }}', pkg.description))
      .pipe(replace('{{ version }}', pkg.version));

    // Create ES6 dist.
    if (tplName === pkg.name) {
      tplSrc.pipe(clone())
        .pipe(tributary(es6src))
        .pipe(rename(tplName + '.es6.js'))
        .pipe(gulp.dest('dist'))
        // Create API doc.
        .pipe(jsdoc2md())
        .pipe(rename('API.md'))
        .pipe(gulp.dest('.'));
    }
    else {
      tplName = pkg.name + '.' + tplName;
    }

    // Create compatible dist.
    tplSrc = tplSrc.pipe(tributary(src))
      .pipe(rename(tplName + '.js'))
      .pipe(gulp.dest('dist'));

    // Create minified version.
    if (tplName === pkg.name) {
      tplSrc.pipe(uglify())
        .pipe(rename(tplName + '.min.js'))
        .pipe(gulp.dest('dist'));
    }
  });
});
