const nconf = require('nconf');
const info = require('./info');
const cprint = require('color-print');

const urlFilter = (req, res, next) => {
	if (req.url == '/favicon.ico') {
		return res.end();
	}
	let { client, static: server } = req.query;

	let curl = decodeURI(req.url);
	if (!server && !(/\/js(.*)?\.map/).test(curl)) {
		let ip = req.headers['x-client-ip'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
		req.locals = {
			ip
		};
		info(cprint.toDarkGray(ip.replace(/[a-z:]/gi, '')), cprint.toGreen(req.method), curl);
	}
	if (client) {
		req.app.get('io').emit(client, { status: 'success' });
	}
	next();
};

const redirect = (req, res, next) => {
	if (req.url.startsWith(`${nconf.get('SOURCE')}/`)) {
		if (req.url.endsWith('/')) {
			req.url = req.url.slice(0, -1);
		}
	} else if (req.url.endsWith('/') && req.url.length != 1) {
		return res.redirect(req.url.slice(0, -1));
	}
	next();
};
const initUrl = (req, res, next) => {
	let dir = nconf.get('UPLOAD_DIR');
	let { url } = req;
	let suffix = '';
	if (req.method == 'GET') {
		if (url.includes('?')) {
			url = url.split('?').shift();
		}
		suffix = url.replace('/', '');
	}
	if (/POST|DELETE|PATCH|PUT/i.test(req.method)) {
		let { referer = '' } = req.headers;
		suffix = referer.replace(`${req.app.get('requestUrl')}/`, '').replace(/\?.*/, '');
	}
	// **Untitled Folder/
	if (suffix) {
		req.practicalDir = decodeURI(`${dir + suffix}`);
	} else {
		req.practicalDir = dir.slice(0, -1);
	}
	next();
};

module.exports.urlFilter = urlFilter;
module.exports.redirect = redirect;
module.exports.initUrl = initUrl;
