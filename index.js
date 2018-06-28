const fs = require('fs');
const nconf = require('nconf');
const bodyParser = require('body-parser');
const info = require('./common/info');
const listenWithoutOccupied = require('./common/listenWithoutOccupied');
const deleteAllInPath = require('./common/deleteAllInPath');
const Middlewares = require('./common/Middlewares');

// 引入expr模块
const express = require('express');
const expr = express();
let server = require('http').Server(expr);
let io = require('socket.io')(server);

nconf.env().file('.config');
nconf.required(['UPLOAD_DIR', 'SOURCE', 'PORT']);

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

if (fs.existsSync(nconf.get('_TMP'))) {
	deleteAllInPath(nconf.get('_TMP'));
}
fs.mkdirSync(nconf.get('_TMP'));

// 配置ejs模板引擎
expr.set('view engine', 'ejs');
// bind io to express
expr.set('io', io);

expr.use(Middlewares.urlFilter);

// 静态目录：外部访问地址自动跳转到/public
let staticDir = UPLOAD_DIR.split('/').splice(1, 1).pop();
expr.use('', express.static(staticDir, {
	dotfiles: 'allow',
}));

require('./routes')(expr);

// 监听端口
listenWithoutOccupied(expr, nconf.get('PORT'), 'Server');
listenWithoutOccupied(io, nconf.get('PORT'), 'Socket');
