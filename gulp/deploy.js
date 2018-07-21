const fs = require('fs');
const gulp = require('gulp');
const GulpSSH = require('gulp-ssh');
const nconf = require('nconf');
const runSequence = require('run-sequence');

nconf.file('.config');
nconf.required([
	'LOCAL_KEY',
	'PRIVATE_KEY',
	'HOST',
	'SSH_PORT',
	'USER_NAME',
]);

let privateKey;
let localKey = nconf.get('LOCAL_KEY');
if (fs.existsSync(localKey)) {
	privateKey = fs.readFileSync(localKey);
} else {
	privateKey = nconf.get('PRIVATE_KEY');
}
if (!privateKey) {
	throw new SyntaxError('Invalid privateKey');
}
const config = {
	host: nconf.get('HOST'),
	port: nconf.get('SSH_PORT'),
	username: nconf.get('USER_NAME'),
	privateKey
};

const gulpSSH = new GulpSSH({
	ignoreErrors: false,
	sshConfig: config
});
const destGlobs = [
	'./**/*.*',
	'./**/*',
	'!**/node_modules/**',
	'!**/logs/**',
	'!**/gallery/**',
	'!*.log',
	'!static/js/?(*.){min,io,qrcode}.js',
	'!views/*.html',
	'!static/css/*.min.css'
];
gulp.task('dest', () => gulp
	.src(destGlobs)
	.pipe(gulpSSH.dest('/root/data/server-localdisk/')));

gulp.task('sftp-read-logs', () => gulpSSH.sftp('read', '/root/data/server-localdisk/.log', {
	filePath: '.log'
})
	.pipe(gulp.dest('logs')));

gulp.task('sftp-write', () => gulp.src('.config')
	.pipe(gulpSSH.sftp('write', '/root/data/server-localdisk/.config')));

gulp.task('shell', [
	'dest'
], () => gulpSSH
	.shell([
		'cd /root/data/server-localdisk',
		'npm install',
		'gulp dev',
		'pm2 start server.json'
	], {
		filePath: 'shell.log'
	})
	.pipe(gulp.dest('logs')));

gulp.task('deploy', cb => {
	runSequence(
		'shell',
		'sftp-read-logs',
		cb
	);
});
