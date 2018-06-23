const requireDir = require('require-dir');
const Middlewares = require('../common/Middlewares');
const routes = {
	api: requireDir('./api')
};
const expr = expr => {
	expr.use(Middlewares.urlFilter);
	expr.use(Middlewares.redirect);
	expr.use(Middlewares.initUrl);
	expr.use(Middlewares.initCors);
	expr.get('/*', routes.api.Index);
	/* 图片上传 */
	expr.post('/upload', routes.api.Upload);
	expr.post('/file/new-folder', routes.api.File.newFolder);
	expr.post('/file/new-file', routes.api.File.newFile);
	expr.put('/file/append', routes.api.File.append);
	expr.delete('/file/delete', routes.api.File.remove);
	expr.patch('/file/rename', routes.api.File.rename);
	expr.post('/folder/download', routes.api.Folder.download);
};

module.exports = expr;
