
// 引入expr模块
const express = require('express');
const expr = express();
const fs = require('fs');
const info = require('./common/info');
const nconf = require('nconf');
const bodyParser = require('body-parser');

nconf.env().file('.config');

expr.use(bodyParser.json());
expr.use(bodyParser.urlencoded({ extended: true }));

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

// 配置ejs模板引擎
expr.set('view engine', 'ejs');

// 静态目录：外部访问地址自动跳转到/public
let staticDir = UPLOAD_DIR.split('/').splice(1, 1).pop();
expr.use('', express.static(staticDir));

require('./routes')(expr);

// 监听端口
require('./common/listenWithoutOccupied')(expr, nconf.get('PORT'));
