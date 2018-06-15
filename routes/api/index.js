const fs = require('fs');
const filesize = require('filesize');
const moment = require('moment');

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
		if (files) {
			let target;
			let size;
			for (let i = files.length - 1; i >= 0; i--) {
				if (files[i].indexOf('.gitKeep') > -1) {
					files.splice(i, 1);
				}
			}
			files.forEach(item => {
				target = '_blank';
				size = '';
				let stats = fs.statSync(req.practicalDir + item);
				if (stats.isDirectory()) {
					target = '_self';
				}
				if (stats.isFile()) {
					size = filesize(stats.size);
				}
				outputFiles.push({
					name: item,
					target,
					size,
					mtime: moment(stats.mtime).format('YYYY-MM-DD HH:mm:SS')
				});
			});
		}
		let links = req.practicalDir.match(/[^/]+/g);
		links.splice(0, 2);
		let baseUrl = '';
		let crumbs = [];
		links.forEach(item => {
			crumbs.push([
				item,
				baseUrl += `/${item}`
			]);
		});
		outputFiles.sort((a, b) => a[0] > b[0]);
		outputFiles.sort((a, b) => a[1] > b[1]);
		outputFiles.reverse();
		res.render('upload', { list: outputFiles, url: req.practicalDir.replace('./static', ''), crumbs });
	});
};
module.exports = index;
