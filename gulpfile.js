var gulp = require('gulp');
var del = require('del');
var fs = require('fs');
var replace = require('gulp-string-replace');
var browserSync = require('browser-sync').create();

var paths = {
  src: 'app/**/*',
  srcHTML: 'app/**/*.html',
  srcCSS: 'app/**/*.css', 
  srcJS: 'app/**/*.js',

  tmp: 'tmp', //tmp folder
  tmpIndex: 'tmp/index.html',
  tmpCSS: 'tmp/**/*.css', 
  tmpJS: 'tmp/**/*.js',

  dist: 'dist', //dist folder
  distIndex: 'dist/index.html',
  distCSS: 'dist/**/*.css', 
  distJS: 'dist/**/*.js',

};

//build
gulp.task('default', ['copy', 'js']);

//gulp  serve and watch
gulp.task('serve', function () {
  browserSync.init({
    server:paths.tmp,
    port: 8000
  });

  gulp.watch(paths.srcJS, ['js-watch']);
});

// build, serve, & watch
gulp.task('serve:build', ['copy', 'js', 'serve']);

// this task ensures the `js` task is complete before reloading browsers
gulp.task('js-watch', ['js'], function (done) {
  browserSync.reload();
  done();
});

// Clean output directory
gulp.task('clean', function () {
  del(['tmp/*', 'dist/*']); // del files rather than dirs to avoid error
});

// HTML
gulp.task('html', function () {
  var apiKey = fs.readFileSync('API_KEY', 'utf8');

  return gulp.src(paths.srcHTML)
    .pipe(replace('<API_KEY_HERE>', apiKey))
    .pipe(gulp.dest(paths.tmp));
});
// CSS
gulp.task('css', function () {
  return gulp.src(paths.srcCSS)
    .pipe(gulp.dest(paths.tmp));
});
// JS
gulp.task('js', function () {
  return gulp.src(paths.srcJS)
    .pipe(gulp.dest(paths.tmp));
});

gulp.task('copy', ['html', 'css', 'js']);