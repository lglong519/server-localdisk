const moment = require('moment');
module.exports = (...rest) => {
	console.info(`[${moment().format('HH:mm:SS')}]`, ...rest);
};
