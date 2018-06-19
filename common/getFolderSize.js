const fs = require('fs');
/**
 * @param {String} path 读取的路径
 * @returns {Object} { size: 3878, files: '7' } size：path 所包含的全部文件的大小的总数，
 * 														 files：直接目录下包含的文件数量
 */
function getFolderSize (path) {
	let files = fs.readdirSync(path);
	let size = 0;
	for (let i = 0; i < files.length; i++) {
		let stats = fs.statSync(`${path}/${files[i]}`);
		if (stats.isFile()) {
			size += stats.size;
		}
		if (stats.isDirectory()) {
			size += getFolderSize(`${path}/${files[i]}`).size;
		}
	}
	return {
		size,
		files: String(files.length)
	};
}

module.exports = getFolderSize;
