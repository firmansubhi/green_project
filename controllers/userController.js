const User = require("../models/User");
const Listing = require("../models/Listing");
const Transaction = require("../models/Transaction");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

exports.all = async (req, res) => {
	try {
		let email = req.query.email;
		let pageNumber = req.query.page;
		let role = req.query.role;

		if (pageNumber === undefined) {
			pageNumber = 1;
		}

		let query = {};
		if (email) {
			query.email = { $regex: new RegExp(email), $options: "i" };
		}

		if (role) {
			query.role = role;
		}

		const rs = await User.paginate(query, {
			page: pageNumber,
			limit: 10,
		});
		const rows = rs.docs;
		let members = [];

		for (var i = 0; i < rows.length; i++) {
			members[i] = {
				id: rows[i]._id.toString(),
				name: rows[i].firstname + " " + rows[i].lastname,
				username: rows[i].username,
				email: rows[i].email,
				city: rows[i].city,
				role: rows[i].role,
			};
		}

		const r = {
			rows: members,
			totalDocs: rs.totalDocs,
			limit: rs.limit,
			totalPages: rs.totalPages,
			page: rs.age,
			pagingCounter: rs.pagingCounter,
			hasPrevPage: rs.hasPrevPage,
			hasNextPage: rs.hasNextPage,
			prevPage: rs.prevPage,
			nextPage: rs.nextPage,
			countDoc: i,
		};

		res.status(200).json({ success: true, data: r });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.listing = async (req, res) => {
	try {
		res.status(500).json({ success: true, message: "ada" });
		return;

		let headline = req.query.headline;
		let pageNumber = req.query.page;

		if (pageNumber === undefined) {
			pageNumber = 1;
		}

		let query = {};
		if (headline) {
			query.headline = { $regex: new RegExp(headline), $options: "i" };
		}

		const rs = await Listing.paginate(query, {
			page: pageNumber,
			limit: 20,
		});
		const rows = rs.docs;
		let listings = [];

		for (var i = 0; i < rows.length; i++) {
			listings[i] = {
				id: rows[i]._id,
				tipe: rows[i].propertytype,
				headline: rows[i].headline,
				price: rows[i].price,
			};
		}

		const r = {
			rows: listings,
			totalDocs: rs.totalDocs,
			limit: rs.limit,
			totalPages: rs.totalPages,
			page: rs.age,
			pagingCounter: rs.pagingCounter,
			hasPrevPage: rs.hasPrevPage,
			hasNextPage: rs.hasNextPage,
			prevPage: rs.prevPage,
			nextPage: rs.nextPage,
		};

		res.status(200).json({ success: true, data: r });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.showall = async (req, res) => {
	try {
		let email = req.query.email;
		let role = req.query.role;

		let query = {};
		if (email) {
			query.email = { $regex: new RegExp(email), $options: "i" };
		}

		if (role) {
			query.role = role;
		}

		const rows = await User.find(query);
		let members = [];

		for (var i = 0; i < rows.length; i++) {
			members[i] = {
				userid: rows[i]._id.toString(),
				name: rows[i].firstname + " " + rows[i].lastname,
				username: rows[i].username,
				email: rows[i].email,
				city: rows[i].city,
				role: rows[i].role,
			};
		}

		const r = {
			rows: members,
		};

		res.status(200).json({ success: true, data: r });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.single = async (req, res) => {
	const id = req.params.id;

	try {
		const row = await User.findById(id);
		row.token = "";
		row.password = "";
		res.status(200).json({
			success: true,
			data: row,
		});
	} catch (error) {
		res.status(404).json({
			success: false,
			message: error.message,
		});
	}
};

exports.add = async (req, res) => {
	const { firstname, lastname, username, email, city, role, password } =
		req.body;

	// Validate input
	if (!username || !email) {
		return res.status(404).json({
			success: false,
			message: "Username and email are required.",
		});
	}

	//check if email address already registered
	const doesUserExit = await User.exists({ email: email });
	if (doesUserExit) {
		return res.status(201).json({
			success: false,
			message: "Email address already registered",
		});
	}

	//check if username already registered
	const doesUsernameExit = await User.exists({ username: username });
	if (doesUsernameExit) {
		return res.status(201).json({
			success: false,
			message: "Username already registered",
		});
	}

	// Hash the password before saving (use bcrypt or similar)
	const hashedPassword = await bcrypt.hash(password, 10);

	const newUser = new User({
		firstname,
		lastname,
		username,
		email,
		city,
		role,
		qrCode: username,
		password: hashedPassword,
	});

	try {
		await newUser.save();
		return res.status(200).json({
			success: true,
			message: "Member inserted successfully.",
		});
	} catch (error) {
		return res.status(500).json({
			success: true,
			message: "An error occurred while saving your request.",
		});
	}
};

exports.edit = async (req, res) => {
	const { _id, firstname, lastname, username, email, city, role, password } =
		req.body;

	let currentID = "";
	try {
		currentID = mongoose.Types.ObjectId.createFromHexString(_id);
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
		return;
	}
	// Validate input
	if (!username || !email) {
		return res.status(404).json({
			success: false,
			message: "Username and email are required.",
		});
	}

	//check if email address already registered in other users
	const doesUserExit = await User.exists({
		_id: { $ne: currentID },
		email: email,
	});
	if (doesUserExit) {
		res.status(201).json({
			success: false,
			message: "Email address already registered in other users",
		});
		return;
	}

	//check if username already registered in other users
	const doesUsernameExit = await User.exists({
		_id: { $ne: currentID },
		username: username,
	});
	if (doesUsernameExit) {
		res.status(201).json({
			success: false,
			message: "Username already registered in other users",
		});
		return;
	}

	let userdata = {
		firstname,
		lastname,
		username,
		email,
		city,
		role,
		qrCode: username,
	};

	if (typeof password !== "undefined") {
		if (password) {
			if (password != "") {
				console.log("dusta", password);

				let hashedPassword = await bcrypt.hash(password, 10);

				userdata = {
					firstname,
					lastname,
					username,
					email,
					city,
					role,
					qrCode: username,
					password: hashedPassword,
				};
			}
		}
	}

	await User.findByIdAndUpdate(_id, userdata, {
		useFindAndModify: false,
	})
		.then((data) => {
			if (!data) {
				res.status(404).json({
					success: false,
					message: "Member not found.",
				});
			} else {
				res.status(200).json({
					success: true,
					message: "Member updated successfully.",
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				success: false,
				message: err.message,
			});
		});
};

exports.delete = async (req, res) => {
	const id = req.params.id;

	await User.findByIdAndDelete(id)
		.then((data) => {
			if (!data) {
				res.status(404).json({
					success: false,
					message: "Member not found",
				});
			} else {
				res.status(200).json({
					success: true,
					message: "Member deleted successfully!",
				});
			}
		})
		.catch((error) => {
			res.status(500).json({
				success: false,
				message: error.message,
			});
		});
};

exports.myProfile = async (req, res) => {
	const id = req.userid;

	try {
		const row = await User.findById(id);
		row.token = "";
		row.password = "";
		res.status(200).json({
			success: true,
			data: row,
		});
	} catch (error) {
		res.status(404).json({
			success: false,
			message: error.message,
		});
	}
};

exports.myPoin = async (req, res) => {
	const userName = req.username;
	let amount = 0;

	try {
		let query = { sellerUsername: userName };

		const summary = await Transaction.aggregate([
			{ $match: query },
			{
				$group: {
					_id: null,
					amount: { $sum: "$amount" },
				},
			},
		]);

		if (summary.length > 0) {
			amount = summary[0].amount;
		}

		res.status(200).json({
			success: true,
			data: amount,
		});
	} catch (error) {
		res.status(404).json({
			success: false,
			message: error.message,
		});
	}
};
