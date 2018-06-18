const fs = require('fs');
const moment = require('moment');
const info = require('./info');
module.exports = message => {
	let updateAt = moment().format('YYYY-MM-DD HH:mm:SS');
	let output = `${message},updateAt:${updateAt}\n`;
	fs.appendFile('./.log', output.replace(/\\x1B\[\d+m|\[(\d+;)?\d+m/ig, ''), err => {
		if (err) {
			fs.appendFile('./.log', `Error: ${err} updateAt:${updateAt}\n`);
			info(err);
			return;
		}
		info(output);
	});
};
