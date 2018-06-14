const fs = require('fs');

const newFolder = (req, res) => {
	let { folderName } = req.body;
	fs.mkdir(`${req.practicalDir}${folderName}`, err => {
		if (err) {
			return res.status(500).send(err);
		}
		res.send({
			status: 'ok'
		});
	});
};
const newFile = (req, res) => {
	let { content } = req.body;
	fs.appendFile(`${req.practicalDir}temp-${Date.now()}.txt`, content, err => {
		if (err) {
			return res.status(500).send(err);
		}
		res.send({
			status: 'ok'
		});
	});
};

exports.newFolder = newFolder;
exports.newFile = newFile;
