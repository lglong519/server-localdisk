
//引入expr模块
const express = require('express');
const expr = express();
const fs = require('fs');
const exec = require("child_process").exec;

let formidable = require('formidable');
let UPLOAD_FOLDER = './public' + '/gallery/';

let interfaces = require('os').networkInterfaces();

let keys = Object.keys(interfaces);
let ip = interfaces[keys[keys.length - 1]][0].address;
if (ip != '192.168.3.200') {
	console.log('err', ip);
	exec(`sudo ifconfig ${keys[keys.length - 1]} 192.168.3.200`, (error, stdout, stderr) => {
		console.log('correct ip:', ip + ":7500");
		exec(`sudo /etc/init.d/networking restart`);
	});
} else {
	console.log('ok:', ip + ":7500");
}

//配置ejs模板引擎
expr.set('view engine', 'ejs');

//外部访问地址自动跳转到/public
expr.use('', express.static('public'));


expr.get('/upload', (req, res) => {
	res.redirect('/');
});
expr.get('/uploader', (req, res) => {
	res.redirect('/');
});

expr.get('/', (req, res) => {
	fs.readdir(UPLOAD_FOLDER, (err, files) => {
		if (files) {
			res.render('upload', { list: files });
		} else {
			res.render('upload', { list: [] });
		}
	})

});



fs.exists(UPLOAD_FOLDER, result => {
	if (!result) {
		fs.mkdir(UPLOAD_FOLDER, (err) => {
			if (err) {
				console.log(err);
			}
		})
	}
});
/* 图片上传路由 */
expr.post('/uploader', (req, res) => {
	var form = new formidable.IncomingForm();   //创建上传表单
	form.encoding = 'utf-8';        //设置编辑
	form.uploadDir = UPLOAD_FOLDER;     //设置上传目录
	form.keepExtensions = true;     //保留后缀
	form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小
	fs.exists(form.uploadDir, result => {
		console.log('路径：', result ? '' : '不', "正确");
		if (result) {
			return;
		} else {
			fs.mkdir(form.uploadDir, (err) => {
				if (err) {
					console.log(err);
				}
			})
		}
	});
	form.on('file', function (filed, file) {
		fs.renameSync(file.path, form.uploadDir + file.name);
		console.log(file.name);
	});
	form.parse(req, function (err, fields, files) {
		if (err) {
			res.locals.error = err;
			res.render(err);
			return;
		}
		res.redirect('/');
	});
});

//3.监听端口

expr.listen(7500);

console.log('Start listenning...');
