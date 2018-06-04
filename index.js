
// 引入expr模块
const express = require('express');
const expr = express();
const fs = require('fs');
const info = require('./common/info');
const nconf = require('nconf');
const host = require('./common/getHost');
nconf.env().file('.config');

let UPLOAD_DIR = nconf.get('UPLOAD_DIR');
// 判断默认的共享目录是否存在
fs.exists(UPLOAD_DIR, result => {
	if (!result) {
		fs.mkdir(UPLOAD_DIR, err => {
			if (err) {
				info('mkdir error', err);
			}
		});
	}
});

const URL = `http://${host}:${nconf.get('PORT')}/`;

// 配置ejs模板引擎
expr.set('view engine', 'ejs');

// 静态目录：外部访问地址自动跳转到/public
let staticDir = UPLOAD_DIR.split('/').splice(1, 1).pop();
expr.use('', express.static(staticDir));

require('./routes')(expr);

// 3.监听端口
expr.listen(nconf.get('PORT'));

info(`Start listenning: ${URL} ,uploadDir:`, UPLOAD_DIR);
