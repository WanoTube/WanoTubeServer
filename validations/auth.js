const Joi = require('joi');

const registerValidator = (data) => {
	const cutoffDate = new Date(Date.now() - (1000 * 60 * 60 * 24 * 365 * 18)); // go back by 21 years
	const rule = Joi.object({
		first_name: Joi.string(),
		last_name: Joi.string(),
		username: Joi.string().min(6).max(225).required(),
		email: Joi.string().min(6).max(225).required().email(),
		password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{6,20}$')).required(),
		birth_date: Joi.date().max(cutoffDate).required()
	})
	return rule.validate(data);
}

module.exports.registerValidator = registerValidator;