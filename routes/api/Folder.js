const archiver = require('archiver');
const fs = require('fs');
const nconf = require('nconf');

const download = (req, res) => {
	let { folderName } = req.body;

	let zipFile = `${nconf.get('TMP')}/${folderName + Date.now()}.zip`;
	let output = fs.createWriteStream(zipFile);
	let archive = archiver('zip', {
		zlib: { level: 9 }
	});
	archive.directory(`${req.practicalDir}/${folderName}`, false);// 是否保留 root
	archive.pipe(output);
	archive.finalize();
	output.on('close', () => {
		res.json({
			status: 'ok',
			zip: zipFile.replace('./static/', '')
		});
	});
};
exports.download = download;
