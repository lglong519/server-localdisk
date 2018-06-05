const fs = require('fs');
const moment = require('moment');
const info = require('./info');
module.exports = message => {
	let updateAt = moment().format('YYYY-MM-DD HH:mm:SS');
	fs.appendFile('./.log', `${message},updateAt:${updateAt}\n`, err => {
		if (err) {
			fs.appendFile('./.log', `Error: ${err} updateAt:${updateAt}\n`);
			info(err);
		}
	});
};
