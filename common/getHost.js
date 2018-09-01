let interfaces = require('os').networkInterfaces();
let values = Object.values(interfaces);
let address = 'undefined';
for (let k of values) {
	if (address !== 'undefined') {
		break;
	}
	for (let i of k) {
		if (!i.address.replace(/[.\d]*/g, '') && i.mac.replace(/[:\d]*/g, '')) {
			if (typeof i.address !== 'string') {
				throw Error(`Invalid Host:${i.address}`);
			}
			address = i.address;
			break;
		}
	}
}
module.exports = address;
