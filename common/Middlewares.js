const nconf = require('nconf');

const redirect = (req, res, next) => {
	let dir = nconf.get('UPLOAD_DIR');
	let { url } = req;
	let suffix = '';
	if (req.method == 'GET') {
		if ((/gallery\/\w+/).test(url)) {
			req.url = url.replace('gallery/', '');
		} else {
			req.url = '/';
		}
		suffix = req.url.replace('/', '');
	}
	if (req.method == 'POST') {
		let { referer = '' } = req.headers;
		if ((/gallery/).test(referer)) {
			suffix = referer.replace(/([^g]*)?gallery\//, '');
		}
	}
	req.practicalDir = `${dir + suffix}`;
	next();
};

module.exports.redirect = redirect;
