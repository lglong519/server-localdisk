const fs = require('fs');
const gulp = require('gulp');
const GulpSSH = require('gulp-ssh');

const config = {
	host: 'wishone.cc',
	port: 22,
	username: 'root',
	privateKey: fs.readFileSync('/home/glenn/.ssh/id_dsa')
};

const gulpSSH = new GulpSSH({
	ignoreErrors: false,
	sshConfig: config
});

gulp.task('dest', () => gulp
	.src(['./**/*.*', '!**/node_modules/**', '!**/logs/**', '!**/gallery/**', '!*.log'])
	.pipe(gulpSSH.dest('/root/data/server-localdisk/')));

gulp.task('sftp-read-logs', () => gulpSSH.sftp('read', '/root/data/server-localdisk/.log', { filePath: '.log' })
	.pipe(gulp.dest('logs')));

gulp.task('sftp-write', () => gulp.src('.config')
	.pipe(gulpSSH.sftp('write', '/root/data/server-localdisk/.config')));

gulp.task('deploy', ['dest'], () => gulpSSH
	.shell(['cd /root/data/server-localdisk', 'npm install', 'pm2 start index.js --name netdisk'], { filePath: 'shell.log' })
	.pipe(gulp.dest('logs')));
