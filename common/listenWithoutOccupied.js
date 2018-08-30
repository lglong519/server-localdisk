let net = require('net');
const log = require('./log');
const host = require('./getHost');
const nconf = require('nconf');
const cprint = require('color-print');

const listenWithoutOccupied = (app, port, expr) => {
	// 创建服务并监听该端口
	let server = net.createServer().listen(port);
	server.on('listening', () => {
		server.close();
		const URL = `http://${host}:${port}`;
		let message;
		if ((/^(development|production)$/i).test(nconf.get('MODE'))) {
			expr.locals.requestUrl = nconf.get('DOMAIN');
			expr.locals.ioUrl = `${expr.locals.requestUrl}:${port}`;
			expr.locals.title = require('../server').apps[0].name;
		} else {
			expr.locals.requestUrl = URL;
			expr.locals.ioUrl = URL;
			expr.locals.title = 'LocalDisk';

		}
		expr.set('requestUrl', expr.locals.requestUrl);
		message = `Server listenning on: ${cprint.toYellow(URL)}, Mode: ${cprint.toRed(nconf.get('MODE'))}, uploadDir: ${nconf.get('UPLOAD_DIR').slice(1)} `;
		app.listen(port, () => {
			log(message, 'server');
		});
	});

	server.on('error', err => {
		server.close();
		if (err.code === 'EADDRINUSE') { // 端口已经被使用
			listenWithoutOccupied(app, ++port, expr);
			return;
		}
		log(err);
	});
};
module.exports = listenWithoutOccupied;
