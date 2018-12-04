const gulp = require("gulp");
const sass = require("gulp-sass");
const cnf = require("./package.json").config;
const autoprefixer = require("gulp-autoprefixer");
const cssnano = require("gulp-cssnano");
const sourcemaps = require("gulp-sourcemaps");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const fileinclude = require("gulp-file-include");
const include = require("gulp-include");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
const browserSync = require("browser-sync");
const imagemin = require("gulp-imagemin");
const rename = require("gulp-rename");
const importCss = require("gulp-import-css");
const runSequence = require("run-sequence");
const del = require("del");

sass.compiler = require("node-sass");

gulp.task("sass", function () {
    return gulp
        .src(cnf.src.sass)
        .pipe(
            plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
        )
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(
            autoprefixer({
                browsers: ["last 15 versions", ">1%", "ie 8", "ie 7"],
                cascade: true
            })
        )
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(cnf.dist.css))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task("html", () => {
    return gulp
        .src(cnf.src.html)
        .pipe(
            plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
        )
        .pipe(
            fileinclude({
                prefix: "@@",
                basepath: "@file"
            })
        )
        .pipe(gulp.dest(cnf.dist.html))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task("js", () => {
    return gulp
        .src(cnf.src.js)
        .pipe(
            plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
        )
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(babel())
        .pipe(include({
            extensions: "js",
            hardFail: true
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(cnf.dist.js))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task("fonts", () => {
    return gulp
        .src(cnf.src.fonts)
        .pipe(gulp.dest(cnf.dist.fonts))
});

gulp.task("img", () => {
    gulp
        .src(cnf.src.img.noCompress)
        .pipe(gulp.dest(cnf.dist.img))
    gulp
        .src(cnf.src.img.compress)
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: false }
                ]
            })
        ]))
        .pipe(gulp.dest(cnf.dist.img))
});

gulp.task("libs", () => {
    gulp
        .src(cnf.libs.css)
        .pipe(
            plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
        )
        .pipe(importCss())
        .pipe(cssnano())
        .pipe(rename({
            dirname: "",
            basename: "libs",
            prefix: "",
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(gulp.dest(cnf.dist.css))
        .pipe(browserSync.reload({ stream: true }));
    gulp
        .src(cnf.libs.js)
        .pipe(
            plumber({ errorHandler: notify.onError("Error: <%= error.message %>") })
        )
        .pipe(babel())
        .pipe(include({
            extensions: "js",
            hardFail: true
        }))
        .pipe(uglify())
        .pipe(gulp.dest(cnf.dist.js))
        .pipe(browserSync.reload({ stream: true }));
});

gulp.task("clean", () => {
    return del(["dist/"])
});

gulp.task("build", ["clean"], () => {
    runSequence(
        "sass",
        "html",
        "js",
        "fonts",
        "img",
        "libs"
    );

});

gulp.task("browser-sync", () => {
    browserSync({
        server: {
            baseDir: "dist/"
        },
        notify: false
    });
});
gulp.task("default", ["browser-sync", "sass", "html", "js", "fonts", "img", "libs"], () => {
    gulp.watch("src/sass/**/*.sass", ["sass"]);
    gulp.watch("src/**/*.html", ["html"]);
    gulp.watch("src/js/**/*.js", ["js"]);
    gulp.watch("src/fonts/**/*.*", ["fonts"]);
    gulp.watch([cnf.src.img.compress, cnf.src.img.noCompress], ["img"]);
    gulp.watch(cnf.libs.css, ["libs"]);
    gulp.watch(cnf.libs.js, ["libs"]);
    gulp.watch("dist/*.html", browserSync.reload)
});

