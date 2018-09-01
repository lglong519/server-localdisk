const gulp = require('gulp');
const htmlmin = require('gulp-htmlmin');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');
const stripCssComments = require('gulp-strip-css-comments');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');

gulp.task('Htmlmin', () => {
	let options = {
		removeComments: true, // 清除HTML注释
		collapseWhitespace: true, // 压缩HTML
		collapseBooleanAttributes: true, // 省略布尔属性的值 <input checked="true"/> ==> <input />
		removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
		removeScriptTypeAttributes: true, // 删除<script>的type="text/javascript"
		removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
		minifyJS: true, // 压缩页面JS
		minifyCSS: true// 压缩页面CSS
	};
	gulp.src('views/*.ejs')
		.pipe(htmlmin(options))
		.pipe(rename({
			extname: '.html'
		}))
		.pipe(gulp.dest(file => file.base));
});

const cssGlobs = [
	'static/css/*.css',
	'!static/css/*.min.css'
];
gulp.task('cssmin', () => {
	gulp.src(cssGlobs)
		// 去掉注释
		.pipe(stripCssComments())
		// auto prefix
		.pipe(autoprefixer('last 2 version'))
		// minify
		.pipe(cleancss())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(file => file.base));
});

const jsGlobs = [
	'static/js/*.js',
	'!static/js/?(*.){min,io,qrcode}.js'
];
gulp.task('babel', () => gulp.src(jsGlobs)
	.pipe(babel({
		presets: [
			'@babel/env'
		]
	}))
	.pipe(uglify())
	.pipe(rename({
		suffix: '.min'
	}))
	.pipe(gulp.dest(file => file.base)));

gulp.task('watch', () => {
	gulp.watch('views/*.ejs', [
		'Htmlmin'
	]);
	gulp.watch(cssGlobs, [
		'cssmin'
	]);
	gulp.watch(jsGlobs, [
		'babel'
	]);
});

gulp.task(
	'dev',
	gulp.parallel(
		'Htmlmin',
		'cssmin',
		'babel'
	)
);

gulp.task(
	'test',
	gulp.parallel(
		'Htmlmin',
		'cssmin',
		'babel',
		'watch'
	)
);
