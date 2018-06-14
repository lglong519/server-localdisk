const nconf = require('nconf');
const info = require('./info');

const redirect = (req, res, next) => {
	info(req.method, decodeURI(req.url));
	if (req.method == 'GET' && (/^\/(index|gallery|upload)\/?$/).test(req.url)) {
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
	// **Untitled Folder/
	req.practicalDir = decodeURI(`${dir + suffix}`);
	next();
};

function initCors (req, res, next) {
	res.header('Access-Control-Allow-Origin', this.locals.requestUrl);
	res.header('Access-Control-Allow-Origin', `http://localhost:${this.locals.requestUrl.split(':').pop()}`);
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type');
	res.header('Access-Control-Allow-Credentials', 'true');
	next();
}

module.exports.redirect = redirect;
module.exports.initUrl = initUrl;
module.exports.initCors = initCors;
