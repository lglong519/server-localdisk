const fs = require('fs');
const cprint = require('color-print');
const log = require('../../common/log');

const newFolder = (req, res) => {
	let { folderName } = req.body;
	fs.mkdir(`${req.practicalDir}/${folderName}`, err => {
		if (err) {
			log(cprint.toRed(err));
			return res.status(500).send(err);
		}
		res.json({
			status: 'ok'
		});
	});
};
const newFile = (req, res) => {
	let { content } = req.body;
	fs.appendFile(`${req.practicalDir}/temp-${Date.now()}.txt`, content, err => {
		if (err) {
			log(cprint.toRed(err));
			return res.status(500).send(err);
		}
		res.json({
			status: 'ok'
		});
	});
};

const remove = (req, res) => {
	let fileName = decodeURI(req.query.fileName);
	let fullPath = `${req.practicalDir}/${fileName}`;
	try {
		if (fs.existsSync(fullPath)) {
			let stats = fs.statSync(fullPath);
			if (stats.isFile()) {
				fs.unlinkSync(fullPath);
			} else {
				deleteAllInPath(fullPath);
			}
			res.json({
				status: 'ok'
			});
		} else {
			return res.status(404).json({
				error: 'ResourceNotFoundError'
			});
		}
	} catch (e) {
		return res.status(500).send(e);
	}
};

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

const rename = (req, res) => {
	let newName = decodeURI(req.query.newName);
	let oldName = decodeURI(req.query.oldName);
	let oldPath = `${req.practicalDir}/${oldName}`;
	let newPath = `${req.practicalDir}/${newName}`;
	try {
		if (fs.existsSync(newName)) {
			return res.status(409).json({
				error: 'ConflictError'
			});
		}
		if (fs.existsSync(oldPath)) {
			fs.renameSync(oldPath, newPath);
			res.json({
				status: 'ok'
			});
		} else {
			return res.status(404).json({
				error: 'ResourceNotFoundError'
			});
		}
	} catch (e) {
		return res.status(500).send(e);
	}
};

exports.newFolder = newFolder;
exports.newFile = newFile;
exports.remove = remove;
exports.rename = rename;
