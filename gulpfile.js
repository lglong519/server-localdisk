const fs = require('fs');
const gulp = require('gulp');
const GulpSSH = require('gulp-ssh');
const nconf = require('nconf');

nconf.file('.config');
nconf.required(['PRIVATE_KEY', 'HOST', 'SSH_PORT', 'USER_NAME']);

let privateKey;
let localKey = '/home/glenn/.ssh/id_dsa0';
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

gulp.task('dest', () => gulp
	.src(['./**/*.*', './**/*', '!**/node_modules/**', '!**/logs/**', '!**/gallery/**', '!*.log'])
	.pipe(gulpSSH.dest('/root/data/server-localdisk/')));

gulp.task('sftp-read-logs', () => gulpSSH.sftp('read', '/root/data/server-localdisk/.log', { filePath: '.log' })
	.pipe(gulp.dest('logs')));

gulp.task('sftp-write', () => gulp.src('.config')
	.pipe(gulpSSH.sftp('write', '/root/data/server-localdisk/.config')));

gulp.task('deploy', ['dest'], () => gulpSSH
	.shell(['cd /root/data/server-localdisk', 'npm install', 'pm2 start index.js --name netdisk', 'pm2 restart netdisk'], { filePath: 'shell.log' })
	.pipe(gulp.dest('logs')));
