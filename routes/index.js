const requireDir = require('require-dir');
const Middlewares = require('../common/Middlewares');
const routes = {
	api: requireDir('./api')
};
const expr = expr => {
	expr.use(Middlewares.redirect);
	expr.get('/*', routes.api.index);
	/* 图片上传 */
	expr.post('/upload', routes.api.upload);
};

module.exports = expr;
