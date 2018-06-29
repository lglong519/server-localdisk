const fs = require('fs');
const cprint = require('color-print');
const log = require('../../common/log');
const moment = require('moment');
const Joi = require('joi');
const deleteAllInPath = require('../../common/deleteAllInPath');

const newFolder = (req, res) => {
	let { folderName } = req.body;
	fs.mkdir(`${req.practicalDir}/${folderName}`, err => {
		if (err) {
			log(cprint.toRed(err));
			return res.status(500).send(err);
		}
		res.json({
			status: 'success'
		});
	});
};
const newFile = (req, res) => {
	let { content } = req.body;
	fs.appendFile(`${req.practicalDir}/${moment(new Date()).format('YYYYMMDD_HHmmss')}.txt`, `${content}\n`, err => {
		if (err) {
			log(cprint.toRed(err), req);
			return res.status(500).send(err);
		}
		res.json({
			status: 'success'
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
				status: 'success'
			});
		} else {
			return res.status(404).json({
				error: 'ResourceNotFoundError'
			});
		}
	} catch (e) {
		log(cprint.toRed(e), req);
		return res.status(500).send(e);
	}
};

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
				status: 'success'
			});
		} else {
			return res.status(404).json({
				error: 'ResourceNotFoundError'
			});
		}
	} catch (e) {
		log(cprint.toRed(e), req);
		return res.status(500).send(e);
	}
};

const append = (req, res) => {
	const schema = Joi.object().keys({
		content: Joi.string().required(),
		fileName: Joi.string().required(),
	});
	const result = Joi.validate(req.query, schema, {
		allowUnknown: true,
		abortEarly: true
	});
	if (result.error) {
		log(cprint.toRed(result.error), req);
		return res.status(409).json(result.error);
	}
	const params = result.value;
	fs.appendFile(`${req.practicalDir}/${params.fileName}`, `${params.content}\n`, err => {
		if (err) {
			log(cprint.toRed(err), req);
			return res.status(500).send(err);
		}
		res.json({
			status: 'success'
		});
	});
};

exports.newFolder = newFolder;
exports.newFile = newFile;
exports.remove = remove;
exports.rename = rename;
exports.append = append;
