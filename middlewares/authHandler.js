
const jwt = require('jsonwebtoken');

exports.requireAuth = (requireToken = true) => (req, res, next) => {
	const authorizationHeader = req.headers['authorization'];
	const accessToken = authorizationHeader && authorizationHeader.split(' ')[1];

	if (!accessToken) {
		if (requireToken) return res.status(401).json('Access Denied');
		else return next();
	}
	else {
		try {
			const user = jwt.verify(accessToken, process.env.TOKEN_SECRET);
			if (!user) {
				if (requireToken) return res.status(401).json('Access Denied');
				else return next();
			}
			req.user = user;
			next();
		}
		catch (err) {
			next(err);
		}
	}
}