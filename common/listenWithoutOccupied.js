let net = require('net');
const log = require('./log');
const host = require('./getHost');
const nconf = require('nconf');

const listenWithoutOccupied = (app, port) => {
	// 创建服务并监听该端口
	let server = net.createServer().listen(port);

	server.on('listening', () => {
		server.close();
		const URL = `http://${host}:${port}/`;
		app.locals.requestUrl = URL.slice(0, -1);
		app.listen(port);
		let message = `Server listenning on: ${URL} , uploadDir: ${nconf.get('UPLOAD_DIR').slice(1)} `;
		log(message);
	});

	server.on('error', err => {
		server.close();
		if (err.code === 'EADDRINUSE') { // 端口已经被使用
			listenWithoutOccupied(app, ++port);
			return;
		}
		log(err);
	});
};
module.exports = listenWithoutOccupied;
