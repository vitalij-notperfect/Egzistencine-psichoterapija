const { src, dest } = require("gulp");
const gulp          = require('gulp');
const browserSync   = require('browser-sync').create();
const sass          = require('gulp-sass')(require('sass'));
const file_include  = require("gulp-file-include");
const del           = require("del");
const autoprefixer  = require("gulp-autoprefixer");
const group_media   = require("gulp-group-css-media-queries");
const clean_css     = require("gulp-clean-css");
const rename        = require("gulp-rename");
const uglify        = require("gulp-uglify-es").default;
const image_min     = require("gulp-imagemin");
const fs            = require('fs');
const ttf2woff      = require("gulp-ttf2woff");
const ttf2woff2     = require("gulp-ttf2woff2");
const fonter        = require("gulp-fonter");

const project_folder = 'dist';
const source_folder = '#src';

// BrowserSync Proxy setings
const browserSyncOptions = {
    watch: true,
    server: {
        baseDir: './' + project_folder + '/'
    },
    port: 3000,
    // notify: false
}

const path = { 
    build: {
        html: project_folder + '/',
        css: project_folder + '/assets/css',
        js: project_folder + '/assets/js',
        img: project_folder + '/assets/img',
        fonts: project_folder + '/assets/fonts',
    },
    src: {
        html: [ source_folder + '/*.html', '!' + source_folder + '/_*.html'],
        scss: source_folder + '/scss/style.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
        fonts: source_folder + '/fonts/**/*.ttf',
        fonts_otf: source_folder + '/fonts/**/*',
        fonts_ttf: source_folder + '/fonts',
        inc_css: source_folder + '/scss/**/*.css',
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    },
    clean: './' + project_folder + '/',
};

// Automatically reloads the page when files changed
const browserSyncWatchFiles = [
    path.build.css,
    path.build.js,
    path.build.html
];

// Static Server + watching scss/html files
gulp.task('browser-sync', () => {
    browserSync.init(browserSyncWatchFiles, browserSyncOptions);
});

// Compile html
gulp.task('html', () => {
    return src(path.src.html)
    .pipe( file_include({
        prefix: '@@',
        basepath: '@file'
    }))
    .pipe( dest(path.build.html) )
    .pipe( browserSync.reload({stream: true}) )
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('styles', () => {
    return src(path.src.scss, { sourcemaps: true })
        .pipe( sass({outputStyle: "expanded"}).on('error', sass.logError) )
        .pipe( group_media() )
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true,
            })
        )
        .pipe( dest(path.build.css) )
        .pipe( clean_css() )
        .pipe( rename({extname: ".min.css"}) )
        .pipe( dest(path.build.css, { sourcemaps: true }) )
        .pipe( browserSync.reload({stream: true}) );
});

// Comppile JS files and move to Assets folder
gulp.task('js', () => {
    return src(path.src.js, { sourcemaps: true })
        .pipe( file_include() )
        .pipe( dest(path.build.js) )
        .pipe( uglify() )
        .pipe( rename({extname: ".min.js"}) )
        .pipe( dest(path.build.js, { sourcemaps: true}) )
        .pipe( browserSync.reload({stream: true}) );
});

// Compress images and move to Assets folder
gulp.task('images', () => {
    return src(path.src.img )
        .pipe( dest(path.build.img) )
        .pipe( src(path.src.img) )
        .pipe(
            image_min({
                progressive: true,
                interlaced: true,
                svgoPlugins: [{ removeViewBox: false }],
                optimizationLevel: 3,
            })
        )
        .pipe( dest(path.build.img) )
        .pipe( browserSync.reload({stream: true}) );
});

gulp.task("ttf2woff", function () {
    src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
    return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
});

gulp.task("otf2ttf", function () {
    return src(path.src.fonts_otf )
        .pipe(fonter({
                formats: ['ttf']
        }))
        .pipe( dest(path.src.fonts_ttf) );
});

// Watching files and directories
gulp.task('watchFiles', function () {
    gulp.watch([path.watch.html], gulp.series('html'));
    gulp.watch([path.watch.css], gulp.series('styles'));
    gulp.watch([path.watch.js], gulp.series('js'));
    gulp.watch([path.watch.img], gulp.series('images'));
});

// Clear Assets folder
gulp.task('clean', () => {
    return del(path.clean);
});

gulp.task('movecCss', () => {
    return gulp.src([path.src.inc_css]) 
        .pipe(gulp.dest(path.build.css));
});

let build = gulp.series('clean', gulp.parallel(['html', 'styles', 'js', 'images', 'movecCss', 'ttf2woff']), 'browser-sync');
let watch = gulp.parallel(build, 'watchFiles' );

exports.build = build;
exports.watch = watch;
exports.default = watch;