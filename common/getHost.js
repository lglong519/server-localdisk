let interfaces = require('os').networkInterfaces();
let values = Object.values(interfaces);
for (let k of values) {
	for (let i of k) {
		if (!i.address.replace(/[.\d]*/g, '') && i.mac.replace(/[:\d]*/g, '')) {
			if (typeof i.address !== 'string') {
				throw Error(`Invalid Host:${i.address}`);
			}
			module.exports = i.address;
			break;
		}
	}
}
