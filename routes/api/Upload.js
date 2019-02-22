const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const info = require('../../common/info');
const log = require('../../common/log');
const nconf = require('nconf');

/* eslint no-unused-vars:1 */

const upload = (req, res) => {
	let form = new formidable.IncomingForm(); // 创建上传表单
	form.encoding = 'utf-8'; // 设置编辑
	form.uploadDir = `${req.practicalDir}/`; // 设置上传目录
	form.keepExtensions = true; // 保留后缀
	form.maxFileSize = 2 * 1024 * 1024 * 1024; // 文件大小 2g
	// 文件接收完成
	form.on('file', (filed, file) => {
		let fileName = file.path.replace(/upload_.*/, file.name.replace(/\s/g, ''));
		if (fs.existsSync(fileName)) {
			fileName = `${fileName.replace(path.extname(fileName), '')}_${Date.now()}${path.extname(fileName)}`;
		}
		fs.renameSync(file.path, fileName);
		log(`upload success: ${fileName}`, req);
	});
	let per;
	form.on('progress', (bytesReceived, bytesExpected) => {
		let percentage = `${parseInt(bytesReceived / bytesExpected * 100)}%`;
		if (per != percentage) {
			per = percentage;
			req.app.get('io').emit('processing', {
				percentage
			});
		}
	});

	// 所有操作完成，代理 node
	form.parse(req, (err, fields, file) => {
		if (err) {
			req.app.get('io').emit('processing', {
				percentage: '100%'
			});
			log(String(err));
		}
		res.redirect(req.practicalDir.replace(nconf.get('UPLOAD_DIR').slice(0, -1), '') || '/');
	});
};
module.exports = upload;
