const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyToken = (req, res, next) => {
	const token = req.headers["authorization"];

	if (!token) {
		return res
			.status(403)
			.json({ status: "error", message: "No token provided" });
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
		if (err) {
			return res
				.status(401)
				.json({ status: "error", message: "Unauthorized" });
		}
		req.userId = decoded.id;
		next();
	});
};

exports.tokenCheck = (allowedRoles) => {
	return async (req, res, next) => {
		const tokenString = req.headers.authorization?.split(" ")[1];

		if (!tokenString) {
			return res
				.status(403)
				.json({ success: false, message: "Unauthorized." });
		}

		try {
			const user = await User.findOne({ token: tokenString });

			if (!user) {
				return res
					.status(403)
					.json({ success: false, message: "User not valid" });
			}

			let allowed = allowedRoles.includes(user.role);

			if (!allowed) {
				return res
					.status(403)
					.json({ success: false, message: "Unauthorized role" });
			}
			req.userid = user._id;
			req.username = user.username;
			req.role = user.role;
			next();
		} catch (err) {
			res.status(403).json({ success: false, message: "Unauthorized" });
		}
	};
};
