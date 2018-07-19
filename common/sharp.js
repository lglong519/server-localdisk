const sharp = require('sharp');
const fs = require('fs');

const imgSharp = (path, name) => {
	let tmpImg = `${process.cwd()}/static/.tmp/${name}.png`;
	if (fs.existsSync(tmpImg)) {
		return Promise.resolve();
	}
	return new Promise((res, rej) => {
		sharp(`${process.cwd()}/static/${path}`)
			.rotate()
			.resize(200)
			.toFile(tmpImg, (err, info) => {
				if (err) {
					rej(err);
					console.error(err);
				} else {
					res(info);
				}
			});
	});
};
module.exports = imgSharp;
