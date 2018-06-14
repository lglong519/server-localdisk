const requireDir = require('require-dir');
const Middlewares = require('../common/Middlewares');
const routes = {
	api: requireDir('./api')
};
const expr = expr => {
	expr.use(Middlewares.redirect);
	expr.use(Middlewares.initUrl);
	expr.use(Middlewares.initCors.bind(expr));
	expr.get('/*', routes.api.index);
	/* 图片上传 */
	expr.post('/upload', routes.api.upload);
	expr.post('/file/new-folder', routes.api.File.newFolder);
	expr.post('/file/new-file', routes.api.File.newFile);
};

module.exports = expr;
