const fs = require('fs');

function deleteAllInPath (path) {
	let files = fs.readdirSync(path);
	if (!files.length) {
		fs.rmdirSync(path);
		return;
	}
	files.forEach(item => {
		let fullPath = `${path}/${item}`;
		let stats = fs.statSync(fullPath);
		if (stats.isFile()) {
			fs.unlinkSync(fullPath);
		} else {
			deleteAllInPath(fullPath);
		}
	});
	deleteAllInPath(path);
}

module.exports = deleteAllInPath;
