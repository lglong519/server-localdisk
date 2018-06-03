const fs = require('fs');
/**
 * @description 负责页面内容的准备：显示的文件列表，文件地址，文件是否在当前页面打开
 */
const index = (req, res) => {
	if (!fs.existsSync(req.practicalDir)) {
		res.render('404');
		return;
	}
	fs.readdir(req.practicalDir, (err, files) => {
		let outputFiles = [];
		let targets = [];
		if (files) {
			for (let i = files.length - 1; i >= 0; i--) {
				if (files[i].indexOf('.gitKeep') > -1) {
					files.splice(i, 1);
				}
			}
			outputFiles = files;
			outputFiles.forEach((item, i) => {
				targets[i] = '_blank';
				let stats = fs.statSync(req.practicalDir + item);
				if (stats.isDirectory()) {
					targets[i] = '_self';
				}
			});
		}
		res.render('upload', { list: outputFiles, url: req.practicalDir.replace('./static', ''), targets });
	});
};
module.exports = index;
