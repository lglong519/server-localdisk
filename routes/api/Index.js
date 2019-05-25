const fs = require('fs');
const filesize = require('filesize');
const moment = require('moment');
const nconf = require('nconf');
const Joi = require('joi');
const getFolderSize = require('../../common/getFolderSize');
const sharp = require('../../common/sharp');
const log = require('../../common/log');

/**
 * @type get
 * @description 负责页面内容的准备：显示的文件列表，文件地址，文件是否在当前页面打开
 * @param {String} [sort] default='name'
 */
const index = (req, res, next) => {
	if (!fs.existsSync(req.practicalDir)) {
		res.status(404);
		res.render('404');
		return;
	}
	const schema = Joi.object().keys({
		sort: Joi.string(),
		client: Joi.string(),
		nsukey: Joi.string(),
	});
	const result = Joi.validate(req.query, schema);
	if (result.error) {
		return res.send(result.error);
	}
	const params = result.value;
	if (params.nsukey) {
		log(`nsukey: ${params.nsukey},client: ${params.client}`, req);
	}
	fs.readdir(req.practicalDir, (err, files) => {
		let outputFiles = [];
		let filesArr = [];
		let foldersArr = [];
		let relativeDir = req.practicalDir.replace(nconf.get('UPLOAD_DIR').slice(0, -1), '').replace('//', '/');
		let promises = [];
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
					outputItem.originSize = info.size;
					outputItem.size = filesize(info.size);
					outputItem.files = info.files;
					foldersArr.push(outputItem);
					return;
				}
				if (stats.isFile()) {
					outputItem.link = nconf.get('SOURCE') + outputItem.link;
					if ((/\.(jpg|gif|png|jpeg|ico|svg)$/i).test(outputItem.link)) {
						outputItem.thumb = outputItem.link;
						if (outputItem.originSize > 800000) {
							let name = outputItem.link.replace(/\/|\./g, '-');
							promises.push(sharp(`${nconf.get('SOURCE')}${relativeDir}/${item}`, name));
							outputItem.thumb = `.tmp/${name}.png`;
						}
					}
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

		foldersArr.sort(filter(params.sort));
		filesArr.sort(filter(params.sort));
		outputFiles = [foldersArr, filesArr];
		if (params.sort == '-type') {
			outputFiles = [].concat(...outputFiles.reverse());
		} else {
			outputFiles = [].concat(...outputFiles);
		}
		Promise.all(promises).then(() => {
			res.render('index', { list: outputFiles, crumbs, MODE: nconf.get('MODE') });
		}).catch(err => {
			next(err);
		});
	});
};

function filter (condition = 'name') {
	let direction = 1;
	if (condition.startsWith('-')) {
		direction = -1;
		condition = condition.slice(1);
	}
	switch (condition) {
		case 'size':
			return (a, b) => direction * compare(a.originSize, b.originSize);
		case 'mtime':
			return (a, b) => direction * compare(a.mtime, b.mtime);
		default: return (a, b) => direction * compare(a.name.toLowerCase(), b.name.toLowerCase());
	}
}
function compare (a, b) {
	if (a == b) {
		return 0;
	}
	if (!isNaN(a - b)) {
		return a - b;
	}
	return a > b ? 1 : -1;
}

function post (req, res) {
	res.sendStatus(200);
}
module.exports.get = index;
module.exports.post = post;
