const nconf = require('nconf');
const info = require('./info');

const redirect = (req, res, next) => {
	info(req.method, decodeURI(req.url));
	if (/^\/(index|gallery)\/?$/.test(req.url)) {
		return res.redirect('/');
	}
	next();
};
const initUrl = (req, res, next) => {
	let dir = nconf.get('UPLOAD_DIR');
	let { url } = req;
	let suffix = '';
	if (req.method == 'GET') {
		if ((/\/gallery\/\w+/).test(url)) {
			suffix = url.replace('/gallery/', '');
		} else {
			suffix = req.url.replace('/', '');
		}
	}
	if (req.method == 'POST') {
		let { referer = '' } = req.headers;
		if ((/gallery/).test(referer)) {
			suffix = referer.replace(/([^g]*)?gallery\//, '');
		}
	}
	req.practicalDir = decodeURI(`${dir + suffix}`);
	next();
};

module.exports.redirect = redirect;
module.exports.initUrl = initUrl;
