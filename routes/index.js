const requireDir = require('require-dir');
const Middlewares = require('../common/Middlewares');
const routes = {
	api: requireDir('./api')
};
const expr = expr => {
	expr.use(Middlewares.redirect);
	expr.use(Middlewares.initUrl);
	expr.get('/*', routes.api.Index.get);
	expr.post('/', routes.api.Index.post);
	expr.post('/upload', routes.api.Upload);
	expr.post('/file/new-folder', routes.api.File.newFolder);
	expr.post('/file/new-file', routes.api.File.newFile);
	expr.put('/file/append', routes.api.File.append);
	expr.delete('/file/delete', Middlewares.authorize, routes.api.File.remove);
	expr.patch('/file/rename', Middlewares.authorize, routes.api.File.rename);
	expr.post('/folder/download', routes.api.Folder.download);
	expr.post('/session', routes.api.session.create);
};

module.exports = expr;
