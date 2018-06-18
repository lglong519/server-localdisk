const moment = require('moment');
const cprint = require('color-print');

module.exports = (...rest) => {
	console.info(`[${cprint.toMagenta(moment().format('HH:mm:SS'))}]`, ...rest);
};
