const nconf = require('nconf');
const info = require('./info');
const log = require('./log');
const cprint = require('color-print');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');

const urlFilter = (req, res, next) => {
	if (req.url == '/favicon.ico') {
		return res.end();
	}
	let { client, static: server } = req.query;

	let curl = decodeURI(req.url);
	if (req.app.get('today') !== moment().format('YYYY-MM-DD')) {
		req.app.set('today', moment().format('YYYY-MM-DD'));
		info('Today', req.app.get('today'), '\n');
	}
	if (!server && !(/\/js(.*)?\.map/).test(curl)) {
		let ip = req.headers['x-client-ip'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
		req.locals = {
			ip
		};
		let msg;
		if (require('./verified') && require('./verified').indexOf(ip) > -1) {
			msg = cprint.toCyan(ip.replace(/[a-z:]/gi, ''));
		} else {
			msg = cprint.toDarkGray(ip.replace(/[a-z:]/gi, ''));
		}
		info(msg, cprint.toGreen(req.method), curl);
		log(req.headers['user-agent'], req, 'connect', 1);
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
	if ((/POST|DELETE|PATCH|PUT/i).test(req.method)) {
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

const authorize = (req, res, next) => {
	if (req.session.password && bcrypt.compareSync(nconf.get('PASSWORD'), req.session.password)) {
		return next();
	}
	res.status(401).json({
		code: 'UNAUTHORIZED'
	});

};

module.exports.urlFilter = urlFilter;
module.exports.redirect = redirect;
module.exports.initUrl = initUrl;
module.exports.authorize = authorize;
