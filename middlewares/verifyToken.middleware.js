
const jwt = require('jsonwebtoken');

exports.requireAuth = function (req, res, next) {
	const authorizationHeader = req.headers['authorization'];
	const accessToken = authorizationHeader || authorizationHeader.split(' ')[1];

	try {
		if (!accessToken)
			return res.status(401).json('Access Denied');

		const user = jwt.verify(authorizationHeader, process.env.TOKEN_SECRET);
		req.user = user;
		next()
	}
	catch (err) {
		next(err)
	}
}