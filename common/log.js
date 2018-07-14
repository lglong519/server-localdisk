const fs = require('fs');
const moment = require('moment');
const info = require('./info');
module.exports = (message, req = {}, file = '') => {
	let updateAt = moment().format('YYYY-MM-DD HH:mm:SS');
	let output = `${message},updateAt:${updateAt}\n`;
	let ip = '';
	if (typeof req === 'string' && !file) {
		[file, req] = [req, {}];
	}
	if (req.locals && req.locals.ip) {
		ip = `[${req.locals.ip}] `;
	}
	fs.appendFile(`./${file}.log`, ip + output.replace(/\\x1B\[\d+m|\[(\d+;)?\d+m/ig, ''), err => {
		if (err) {
			fs.appendFile('./.log', `Error: ${err} updateAt:${updateAt}\n`);
			info(err);
			return;
		}
		info(output);
	});
};
