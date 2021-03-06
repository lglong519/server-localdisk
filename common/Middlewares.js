const nconf = require('nconf');
const info = require('./info');
const log = require('./log');
const cprint = require('color-print');
const bcrypt = require('bcrypt-nodejs');
const moment = require('moment');
const Cors = require('cors');
const onFinished = require('on-finished');
const getStatusColor = require('./getStatusColor');

nconf.required([
	'VERIFIED',
	'SOURCE',
	'UPLOAD_DIR',
	'CORS',
	'PASSWORD'
]);

const urlFilter = (req, res, next) => {
	if (req.url == '/favicon.ico' || req.url == '/main/favicon.ico') {
		return res.end();
	}
	let {
		client,
		lglong519: server
	} = req.query;

	let curl = decodeURI(req.url);
	if (req.app.get('today') !== moment().format('YYYY-MM-DD')) {
		req.app.set('today', moment().format('YYYY-MM-DD'));
		info('Today', req.app.get('today'), '\n');
	}
	if (!server && !(/\/js(.*)?\.map/).test(curl)) {
		let ip = req.headers['x-client-ip'] || req.headers['x-real-ip'] || req.connection.remoteAddress || '';
		ip && (ip = ip.replace(/[a-z:]/gi, ''));
		req.locals = {
			ip
		};
		let msg;
		if (nconf.get('VERIFIED').includes(ip.split('.').slice(0, -1).join('.'))) {
			msg = cprint.toCyan(ip);
		} else {
			msg = cprint.toDarkGray(ip);
		}
		let {
			'user-agent': agent,
		} = req.headers;
		onFinished(res, (err, res) => {
			if (err) {
				return console.log(err);
			}
			info(msg, cprint.toGreen(req.method), `\x1B[${getStatusColor(res.statusCode)}m${res.statusCode}\x1B[39m`, curl);
		});
		log(agent, req, 'connect', 1);
	}
	if (client) {
		req.app.get('io').emit(client, {
			status: 'success'
		});
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
	let {
		url
	} = req;
	let suffix = '';
	if (req.method == 'GET') {
		if (url.includes('?')) {
			url = url.split('?').shift();
		}
		suffix = url.replace('/', '');
	}
	if ((/POST|DELETE|PATCH|PUT/i).test(req.method)) {
		let {
			referer = ''
		} = req.headers;
		suffix = referer.replace(/^http[s]{0,1}:\/\/([^/]*)?\/|\?.*/g, '');
	} else {
		// 根据不同的域名设置请求链接
		let {
			host,
			referer
		} = req.headers;
		if (!req.app.locals.requestUrl.includes(host)) {
			if (nconf.get('CORS').join().indexOf(host) !== -1) {
				let [, oldHost] = req.app.locals.requestUrl.match(/^http[s]{0,1}:\/\/([^/]*)?/);
				req.app.locals.ioUrl = req.app.locals.requestUrl = req.app.locals.requestUrl.replace(oldHost, host);
			} else {
				info('warnning host:', host, referer);
			}
		}
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
	log(`authorize failed: ${req.session.password}`, req, '', 1);
	res.status(401).json({
		code: 'UNAUTHORIZED'
	});

};

const corsOptions = {
	origin (origin, callback) {
		if (!origin || origin === 'null') {
			return callback(null, true);
		}
		if (nconf.get('CORS').join().indexOf(origin.replace(/^http(s)?:\/\/(www\.)?/, '')) !== -1) {
			callback(null, true);
		} else {
			callback(new Error(`Not allowed by CORS:${origin}`));
		}
	}
};
const cors = Cors(corsOptions);

module.exports.urlFilter = urlFilter;
module.exports.redirect = redirect;
module.exports.initUrl = initUrl;
module.exports.authorize = authorize;
module.exports.cors = cors;
