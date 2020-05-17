const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
// const concat = require('gulp-concat');

const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const browserify = require('browserify');
const babel = require('babelify');

const plumber = require('gulp-plumber');
const sourcemap = require('gulp-sourcemaps');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const server = require('browser-sync').create();
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
const svgstore = require('gulp-svgstore');
const posthtml = require('gulp-posthtml');
const include = require('posthtml-include');
const del = require('del');

const paths = {
  common: {
    dist: 'dist'
  },
  html: {
    watchFiles: 'source/*.html',
    source: [
      'source/index.html'
    ]
  },
  js: {
    watchFiles: 'source/js/script.js',
    source: [
      'node_modules/@babel/polyfill/dist/polyfill.min.js',
      'source/js/script.js'
    ],
    destMapFolder: './maps'
  },
  sass: {
    watchFiles: 'source/sass/**/*.{scss,sass}',
    source: 'source/sass/style.scss',
    renameTo: 'style.min.css',
    dest: 'dist/css',
    destMapFolder: './maps'
  },
  images: {
    watchFiles: 'source/img/*.{png,jpg,svg}',
    source: 'source/img/*.{png,jpg,svg}',
    destFolder: 'dist/img',
    webp: {
      source: 'source/img/*.{png,jpg}',
      dest: 'dist/img'
    },
    sprite: {
      source: 'source/img/{icon-*,htmlacademy*}.svg',
      renameTo: 'sprite_auto.svg',
      dest: 'dist/img'
    }
  },
  copy: {
    source: [
      'source/fonts/**/*.{woff,woff2,ttf}',
      'source/img/**',
      'source//*.ico'
    ]
  },
  build: {
    destMinCSSFileName: 'bundle.min.css',
    destMinJSFileName: 'bundle.min.js'
  }
};

gulp.task('html', () => {
  return gulp.src(paths.html.watchFiles)
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(paths.common.dist));
});

gulp.task('js', (done) => {
  const bundler = browserify({ entries: paths.js.source }, { debug: true }).transform(babel);
  bundler.bundle()
    .on('error', function (err) { console.error(err); this.emit('end'); })
    .pipe(source(paths.build.destMinJSFileName))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .pipe(sourcemaps.write(paths.js.destMapFolder))
    .pipe(gulp.dest(paths.common.dist));
  done();
});

gulp.task('css', () => {
  return gulp.src(paths.sass.source)
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS({ debug: true }))
    .pipe(csso())
    .pipe(rename(paths.sass.renameTo))
    .pipe(sourcemaps.write(paths.sass.destMapFolder))
    .pipe(gulp.dest(paths.sass.dest))
    .pipe(server.stream());
});

gulp.task('refresh', (done) => {
  server.reload();
  done();
});

gulp.task('images', () => {
  return gulp.src(paths.images.source)
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest(paths.images.destFolder));
});

gulp.task('webp', () => {
  return gulp.src(paths.images.webp.source)
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest(paths.images.webp.dest));
});

gulp.task('sprite', () => {
  return gulp.src(paths.images.sprite.source)
    .pipe(svgstore({inlineSvg: true}))
    .pipe(rename(paths.images.sprite.renameTo))
    .pipe(gulp.dest(paths.images.sprite.dest));
});

gulp.task('copy', () => {
  return gulp.src(paths.copy.source, {
    base: 'source'
  }).pipe(gulp.dest(paths.common.dist));
});

gulp.task('clean', () => {
  return del(paths.common.dist);
});

gulp.task('server', () => {
  server.init({
    server: 'dist/',
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch(paths.js.watchFiles, gulp.series('js', 'refresh'));
  gulp.watch(paths.sass.watchFiles, gulp.series('css'));
  gulp.watch(paths.images.watchFiles, gulp.series('sprite', 'html', 'refresh'));
  gulp.watch(paths.html.watchFiles, gulp.series('html', 'refresh'));
});

gulp.task('build', gulp.series('clean', 'copy', 'css', 'sprite', 'html', 'js'));
gulp.task('start', gulp.series('build', 'server'));
