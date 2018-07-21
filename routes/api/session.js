const Joi = require('joi');
const cprint = require('color-print');
const log = require('../../common/log');
const bcrypt = require('bcrypt-nodejs');
const nconf = require('nconf');

nconf.required(['PASSWORD']);

const create = (req, res, next) => {
	const schema = Joi.object().keys({
		password: Joi.string().required(),
	});
	const result = Joi.validate(req.body, schema, {
		abortEarly: true
	});
	if (result.error) {
		log(cprint.toRed(result.error), req);
		return res.status(409).json(result.error);
	}
	const { value: params } = result;
	let password = bcrypt.hashSync(params.password);
	if (bcrypt.compareSync(nconf.get('PASSWORD'), password)) {
		req.session.password = password;
		return res.json({
			status: 'success'
		});
	}
	return res.status(401).json({
		code: 'success'
	});
};
module.exports = {
	create
};
