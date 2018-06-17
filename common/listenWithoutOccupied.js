let net = require('net');
const log = require('./log');
const host = require('./getHost');
const nconf = require('nconf');

const listenWithoutOccupied = (app, port, type) => {
	// 创建服务并监听该端口
	let server = net.createServer().listen(port);
	server.on('listening', () => {
		server.close();
		const URL = `http://${host}:${port}`;
		let message;
		if (type === 'Server') {
			app.locals.requestUrl = URL;
			app.set('requestUrl', app.locals.requestUrl);
			message = `${type} listenning on: ${URL} , uploadDir: ${nconf.get('UPLOAD_DIR').slice(1)} `;
		} else {
			app.ioUrl = URL;
			message = `${type} listenning on: ${URL}`;
		}
		let noLog = true;
		app.listen(port, () => {
			noLog = false;
			log(message);
		});
		if (noLog) {
			log(message);
		}
	});

	server.on('error', err => {
		server.close();
		if (err.code === 'EADDRINUSE') { // 端口已经被使用
			listenWithoutOccupied(app, ++port, type);
			return;
		}
		log(err);
	});
};
module.exports = listenWithoutOccupied;
