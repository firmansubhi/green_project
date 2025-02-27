const User = require("../models/User");
const UserToken = require("../models/UserToken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
require("dotenv").config();
const { encrypt } = require("../encryption.js");
const moment = require("moment");

const transporter = nodemailer.createTransport({
	service: "Gmail",
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});
//const delay = (time) => new Promise((res) => setTimeout(res, time));
exports.login = async (req, res) => {
	//await delay(3000);
	const { username, password } = req.body;

	if (!validateFields({ username, password }, res)) return;

	try {
		let user = await User.findOne({ username });
		if (!user) {
			user = await User.findOne({ email: username });
		}
		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res.status(401).json({
				success: false,
				message: "Invalid username or password.",
			});
		}

		if (!user.verified) {
			return res.status(401).json({
				success: false,
				message: "unverified",
				email: user.email,
			});
		}

		const tokenString = crypto.randomBytes(32).toString("hex");
		const tokenSend = encrypt(tokenString);
		let nextDate = moment().add(1, "days");

		const newToken = new UserToken({
			userId: user._id.toString(),
			token: tokenString,
			expiredDate: nextDate,
		});
		await newToken.save();

		user.token = tokenString;
		await user.save();

		res.status(200).json({
			success: true,
			message: "Login successful!",
			token: tokenSend,
			role: user.role,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

const validateFields = (fields, res) => {
	for (const field in fields) {
		if (!fields[field]) {
			res.status(400).json({
				success: false,
				message: `${field} is required.`,
			});
			return false;
		}
	}
	return true;
};

exports.joinMember = async (req, res) => {
	const { firstname, lastname, username, email, city, password } = req.body;

	if (
		!validateFields(
			{ firstname, lastname, username, email, city, password },
			res
		)
	)
		return;

	try {
		// Check if username or email already exists
		const [doesUserExist, doesUsernameExist] = await Promise.all([
			User.exists({ email }),
			User.exists({ username }),
		]);

		if (doesUserExist) {
			return res.status(409).json({
				success: false,
				message: "Email address already registered.",
			});
		}
		if (doesUsernameExist) {
			return res.status(409).json({
				success: false,
				message: "Username already registered.",
			});
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		const newUser = new User({
			firstname,
			lastname,
			username,
			email,
			password: hashedPassword,
			role: "seller",
			qrCode: username,
			vcode: "",
			city,
			verified: false,
		});

		await newUser.save();

		res.status(201).json({
			success: true,
			message: "Join request submitted successfully!",
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.verifyCode = async (req, res) => {
	const { email, code } = req.body;

	try {
		const row = await User.findOne({ email: email });

		if (code === row.vcode) {
			await User.updateMany({ email: email }, { verified: true });
			res.status(200).json({
				success: true,
				message: "Verification successful",
			});
		} else {
			res.status(400).json({
				success: false,
				message: "Invalid verificaton code.",
			});
		}
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.sendVerification = async (req, res) => {
	const { email } = req.body;

	// Generate a random verification code
	const verificationCode = Math.floor(
		100000 + Math.random() * 900000
	).toString(); // 6-digit code

	await User.updateMany({ email: email }, { vcode: verificationCode });

	// Set up email options
	const mailOptions = {
		from: process.env.EMAIL_USER, // Your email address
		to: email,
		subject: "Verification Code",
		text: `Your verification code is: ${verificationCode}`,
	};

	// Send the email
	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.error("Error sending email:", error); // Log the error
			return res.status(500).json({
				success: false,
				message: "An error occurred while sending the email." + info,
			});
		}
		res.status(200).json({
			success: true,
			message: "Verification code sent successfully!",
		});
	});
};

exports.testLogin = (req, res) => {
	res.status(200).json({
		success: true,
		username: req.username,
		role: req.role,
		message: "You are logged in!",
	});
};
