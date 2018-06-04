const fs = require('fs');
const formidable = require('formidable');
const moment = require('moment');
const info = require('../../common/info');
const _ = require('lodash');

const upload = (req, res) => {
	let form = new formidable.IncomingForm(); // 创建上传表单
	form.encoding = 'utf-8'; // 设置编辑
	form.uploadDir = req.practicalDir; // 设置上传目录
	form.keepExtensions = true; // 保留后缀
	form.maxFieldsSize = 2 * 1024 * 1024; // 文件大小
	// 文件接收完成
	form.on('file', (filed, file) => {
		let fileName = file.path.replace(/upload_.*/, file.name.replace(/\s/g, ''));
		fs.renameSync(file.path, fileName);
		info('Uploaded', fileName);
		let updateAt = moment().format('YYYY-MM-DD HH:mm:SS');
		fs.appendFile('./.log', `upload success: ${fileName} updateAt:${updateAt}\n`, err => {
			if (err) {
				fs.appendFile('./.log', `Error file: ${file.path}\nMessage: ${err} updateAt:${updateAt}\n`);
				info(err);
			}
		});
	});
	// 所有操作完成，代理 node
	form.parse(req, (err, fields, file) => {
		if (err) {
			info(String(err));
		}
		res.redirect(req.practicalDir.replace('./static/', ''));
	});
};
module.exports = upload;
