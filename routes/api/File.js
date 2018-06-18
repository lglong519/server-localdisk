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
		res.send({
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
		res.send({
			status: 'ok'
		});
	});
};

const remove = (req, res) => {
	let fileName = decodeURI(req.query.fileName);
	fs.exists(`${req.practicalDir}/${fileName}`, result => {
		if (!result) {
			return res.status(404).send('ResourceNotFoundError');
		}
		fs.unlink(`${req.practicalDir}/${fileName}`, err => {
			if (err) {
				log(cprint.toRed(err));
				return res.status(500).send(err);
			}
			res.send({
				status: 'ok'
			});
		});
	});

};

exports.newFolder = newFolder;
exports.newFile = newFile;
exports.remove = remove;
