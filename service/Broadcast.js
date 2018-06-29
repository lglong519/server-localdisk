const bcrypt = require('bcrypt-nodejs');

module.exports = io => {
	io.on('connection', client => {
		client.on('broadcast', msg => {
			try {
				if (msg.code) {
					if (bcrypt.compareSync(msg.code, '$2a$10$LT2a8yrrQQCHRzP7lTfsuuauGbCiTOhk.PMn/upHbOol.1dY6mfem')) {
						return io.emit('broadcastReceiver', {
							status: 'resolved'
						});
					}
				}
				throw msg;
			} catch (e) {
				client.emit('broadcastReceiver', {
					error: e,
					status: 'rejected'
				});
			}
		});
	});
};
