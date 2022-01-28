const jwt = require('jsonwebtoken');

module.exports = (request, response, next) => {
	const token = request.header('auth-token');

	if (!token) return response.status(401).json('Access Denied');
	try {
		const verified = jwt.verify(token, process.env.TOKEN_SECRET);
		next();
	} catch (err) {
		console.log(err)
		return response.status(400).json('Invalid Token');
	}
};