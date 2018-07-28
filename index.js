const fs = require('fs');
const nconf = require('nconf');
const bodyParser = require('body-parser');
const info = require('./common/info');
const listenWithoutOccupied = require('./common/listenWithoutOccupied');
const deleteAllInPath = require('./common/deleteAllInPath');
const Middlewares = require('./common/Middlewares');
const cors = require('cors');
const session = require('express-session');
const ejs = require('ejs');
const moment = require('moment');

// 引入expr模块
const express = require('express');
const expr = express();
let server = require('http').Server(expr);
let io = require('socket.io')(server);
require('./service/Broadcast')(io);
nconf.env().file('.config');
nconf.required(['UPLOAD_DIR', 'SOURCE', 'PORT', '_TMP', 'CORS']);

if (!(/localhost|development|production/).test(nconf.get('MODE'))) {
	throw Error(`Invalid mode: ${nconf.get('MODE')}`);
}

expr.use(bodyParser.json());
expr.use(bodyParser.urlencoded({ extended: true }));

nconf.required(['EXP_SECRET', 'AUTHENTICATION', 'SESSION_EXPIRED']);
expr.use(session({
	secret: nconf.get('EXP_SECRET'),
	name: nconf.get('AUTHENTICATION'),
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: nconf.get('SESSION_EXPIRED')
	},
	rolling: true
}));

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
expr.engine('html', ejs.__express);
expr.set('view engine', 'html');
// bind io to express
expr.set('io', io);
expr.set('today', moment().format('YYYY-MM-DD'));

expr.use(Middlewares.urlFilter);

// CORS
const corsOptionsDelegate = function (req, callback) {
	let corsOptions;
	if (nconf.get('CORS').indexOf(req.header('Origin')) !== -1) {
		corsOptions = { origin: true };
	} else {
		corsOptions = { origin: false };
	}
	callback(null, corsOptions);
};
expr.use(cors(corsOptionsDelegate));

// 静态目录：外部访问地址自动跳转到/public
let staticDir = UPLOAD_DIR.split('/').splice(1, 1).pop();
expr.use('', express.static(staticDir, {
	dotfiles: 'allow',
}));

require('./routes')(expr);

// 监听端口
listenWithoutOccupied(server, nconf.get('PORT'), expr);
