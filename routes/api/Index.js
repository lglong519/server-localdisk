const fs = require('fs');
const filesize = require('filesize');
const moment = require('moment');
const nconf = require('nconf');
const Joi = require('joi');
const getFolderSize = require('../../common/getFolderSize');

/**
 * @type get
 * @description 负责页面内容的准备：显示的文件列表，文件地址，文件是否在当前页面打开
 * @param {String} [sort] default='name'
 */
const index = (req, res) => {
	if (!fs.existsSync(req.practicalDir)) {
		res.render('404');
		return;
	}
	const schema = Joi.object().keys({
		sort: Joi.string(),
		client: Joi.string()
	});
	const result = Joi.validate(req.query, schema);
	if (result.error) {
		return res.send(result.error);
	}
	const params = result.value;

	fs.readdir(req.practicalDir, (err, files) => {
		let outputFiles = [];
		let filesArr = [];
		let foldersArr = [];
		let relativeDir = req.practicalDir.replace(nconf.get('UPLOAD_DIR').slice(0, -1), '').replace('//', '/');
		if (files) {
			for (let i = files.length - 1; i >= 0; i--) {
				if (files[i].indexOf('.gitKeep') > -1) {
					files.splice(i, 1);
				}
			}
			files.forEach(item => {
				let path = `${req.practicalDir}/${item}`;
				let stats = fs.statSync(path);
				let outputItem = {
					name: item,
					target: '_blank',
					size: filesize(stats.size),
					// 如果是根目录 link=/123,否则 link=/sub/123
					link: `${relativeDir}/${item}`,
					mtime: moment(stats.mtime).format('YYYY-MM-DD HH:mm:SS'),
					originSize: stats.size
				};

				if (stats.isDirectory()) {
					outputItem.target = '_self';
					let info = getFolderSize(path);
					outputItem.size = filesize(info.size);
					outputItem.files = info.files;
					foldersArr.push(outputItem);
					return;
				}
				if (stats.isFile()) {
					outputItem.link = nconf.get('SOURCE') + outputItem.link;
				}
				filesArr.push(outputItem);
			});
		}
		let links = relativeDir.match(/[^/]+/g) || [];
		let baseUrl = '';
		let crumbs = [['/', '/']];
		links.forEach(item => {
			crumbs.push([
				item,
				baseUrl += `/${item}`
			]);
		});
		let ioUrl = req.app.get('io').ioUrl;

		foldersArr.sort(filter(params.sort));
		filesArr.sort(filter(params.sort));
		outputFiles = [].concat(foldersArr, filesArr);

		res.render('upload', { list: outputFiles, crumbs, ioUrl });
	});
};

function filter (condition = 'default') {
	switch (condition) {
		case 'size':
			return (a, b) => a.originSize > b.originSize;
		case 'target':
			console.log('target');
			return;
		default: return (a, b) => a.name.toLowerCase() > b.name.toLowerCase();
	}
}
module.exports = index;
