const mongoose = require("mongoose");
const moment = require("moment");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Product = require("../models/Product");
const QRCode = require("qrcode");

exports.scanQRCode = async (req, res) => {
	res.status(200).json({ status: "success", memberId: req.userid });
};

exports.myQRCode = async (req, res) => {
	let username = req.query.username;

	try {
		if (username === undefined) {
			username = req.username;
		}

		const user = await User.findOne({ username });
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "Invalid username.",
			});
		}

		const uid = user._id.toString();
		const qrCodeImage = await QRCode.toDataURL(uid, { width: 800 });

		return res.status(200).json({
			success: true,
			data: qrCodeImage,
		});
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.all = async (req, res) => {
	try {
		//get query string from frontend
		let sellerUsername = req.query.sellerUsername;
		let pageNumber = req.query.page;

		//if page number is undefined. set to 1
		if (pageNumber === undefined) {
			pageNumber = 1;
		}

		//define empty filter
		let query = {};

		//if sellerUsername not empty, add filter
		if (sellerUsername) {
			query.sellerUsername = sellerUsername;
		}

		//filter to make sure seller only can only see their data
		if (req.usergroup == "seller") {
			query.sellerUsername = req.username;
		}

		//filter to make sure receivere cannot see another receiver data
		if (req.usergroup == "receiver") {
			query.receiverUsername = req.username;
		}

		//get data from database
		const rs = await Transaction.paginate(query, {
			page: pageNumber,
			limit: 10,
			sort: { finished: 1, createdAt: 1 },
		});
		const rows = rs.docs;

		//define empty data
		let data = [];

		let sellerName = "";
		let receiverName = "";
		let buyerName = "";
		let productName = "";

		for (var i = 0; i < rows.length; i++) {
			if (typeof rows[i].seller.firstname !== "undefined") {
				sellerName =
					rows[i].seller.firstname + " " + rows[i].seller.lastname;
			}

			if (typeof rows[i].receiver.firstname !== "undefined") {
				receiverName =
					rows[i].receiver.firstname +
					" " +
					rows[i].receiver.lastname;
			}

			if (typeof rows[i].buyer !== "undefined") {
				buyerName =
					rows[i].buyer.firstname + " " + rows[i].buyer.lastname;
			}

			if (typeof rows[i].seller.firstname !== "undefined") {
				productName = rows[i].product.name;
			}

			//append database row to data
			data[i] = {
				id: rows[i]._id.toString(),
				sid:
					pageNumber +
					"-" +
					rows[i]._id.toString() +
					"-" +
					moment().unix().toString(),
				transID: rows[i].transID,
				seller: rows[i].seller,
				receiver: rows[i].receiver,
				buyer: rows[i].buyer,
				product: rows[i].product,
				weight: rows[i].weight,
				amount: rows[i].amount,
				status: rows[i].status,
				createdAt: moment(rows[i].createdAt).format(
					"ddd, D MMM YY HH:mm"
				),

				sellerName: sellerName,
				receiverName: receiverName,
				buyerName: buyerName,
				productName: productName,
			};
		}

		//calculate summary of weight and amount
		let totalWeight = 0;
		let totalAmount = 0;

		if (rows.length > 0) {
			const summary = await Transaction.aggregate([
				{ $match: query },
				{
					$group: {
						_id: null,
						weight: { $sum: "$weight" },
						amount: { $sum: "$amount" },
					},
				},
			]);
			totalWeight = summary[0].weight;
			totalAmount = summary[0].amount;
		}

		//calculate data to be sent to the frontend
		const r = {
			rows: data,
			totalDocs: rs.totalDocs,
			limit: rs.limit,
			totalPages: rs.totalPages,
			page: rs.age,
			pagingCounter: rs.pagingCounter,
			hasPrevPage: rs.hasPrevPage,
			hasNextPage: rs.hasNextPage,
			prevPage: rs.prevPage,
			nextPage: rs.nextPage,
			totalAmount: totalAmount,
			totalWeight: totalWeight,
			countDoc: i,
		};

		//sent data to the frontend
		res.status(200).json({ success: true, data: r });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.single = async (req, res) => {
	//get ID from URL parameter
	const id = req.params.id;

	try {
		//get data from database
		const row = await Transaction.findById(id);
		//sent data to the frontend
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
	//get data from frontend
	const { sellerId, productId, weight } = req.body;

	//get request data from tokenCheck function
	const receiverUsername = req.username;

	// Validate input
	if (!sellerId || !productId || !weight) {
		return res.status(404).json({
			success: false,
			message: "All data are required.",
		});
	}

	try {
		//get seller data from database
		const seller = await User.findById(sellerId);

		//if seller not valid, return error message
		if (!seller) {
			return res.status(500).json({
				success: false,
				message: "Seller Not Found",
			});
		}

		//get receiver data from database
		const receiver = await User.findOne({
			username: receiverUsername,
		});

		//if receiver not valid, return error message
		if (!receiver) {
			return res.status(500).json({
				success: false,
				message: "Receiver Not Found",
			});
		}

		//get product data from database
		const product = await Product.findById(productId);

		//calculate total amount
		let totalAmount = product.price * weight;

		//create generated transaction ID
		const newID = await generateTransID();

		//set saved data
		const newTransaction = new Transaction({
			transID: newID,
			seller: seller,
			receiver: receiver,
			product: product,
			sellerUsername: seller.username,
			receiverUsername: receiver.username,
			weight: weight,
			status: "pending",
			amount: totalAmount,
			createdAt: new Date(),
			finished: false,
		});

		try {
			//saving data to the database
			await newTransaction.save();
			res.status(200).json({
				success: true,
				message: "Product received",
			});
		} catch (error) {
			res.status(500).json({
				success: true,
				error: "An error occurred while saving your request.",
			});
		}
	} catch (error) {
		res.status(404).json({
			success: false,
			message: error.message,
		});
	}
};

exports.edit = async (req, res) => {
	//get data from frontend
	const { _id, sellerId, productId, weight } = req.body;

	//create object ID for mongoDB based on given ID (_id)
	let currentID = "";
	try {
		currentID = mongoose.Types.ObjectId.createFromHexString(_id);
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
		return;
	}

	// Validate input
	if (!sellerId || !productId || !weight) {
		return res.status(404).json({
			success: false,
			message: "All data are required.",
		});
	}

	try {
		//get seller data from database
		const seller = await User.findById(sellerId);

		//if seller not valid, return error message
		if (!seller) {
			return res.status(500).json({
				success: false,
				message: "Seller Not Found",
			});
		}

		//get product data from database
		const product = await Product.findById(productId);

		//calculate total amount
		let totalAmount = product.price * weight;

		try {
			//update data
			await Transaction.updateOne(
				{ _id: currentID },
				{
					seller: seller,
					product: product,
					weight: weight,
					sellerUsername: seller.username,
					amount: totalAmount,
					updatedAt: new Date(),
				}
			);
			res.status(200).json({
				success: true,
				message: "Data updated",
			});
		} catch (error) {
			res.status(500).json({
				success: true,
				error: "An error occurred while saving your request.",
			});
		}
	} catch (error) {
		res.status(404).json({
			success: false,
			message: error.message,
		});
	}
};

exports.delete = async (req, res) => {
	//get ID from URL parameter
	const id = req.params.id;

	//delete from database
	await Transaction.findByIdAndDelete(id)
		.then((data) => {
			if (!data) {
				res.status(404).json({
					success: false,
					message: "Transaction not found",
				});
			} else {
				res.status(200).json({
					success: true,
					message: "Transaction deleted successfully!",
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

exports.finalizeGoods = async (req, res) => {
	//get ID from URL parameter
	const id = req.params.id;

	const buyer = await User.findById(req.userid);

	await Transaction.findByIdAndUpdate(
		id,
		{
			status: "finalized",
			buyer: buyer,
			buyerUsername: buyer.username,
			finished: true,
		},
		{
			useFindAndModify: false,
		}
	)
		.then((data) => {
			if (!data) {
				res.status(404).json({
					success: false,
					message: "Transaction not found.",
				});
			} else {
				res.status(200).json({
					success: true,
					message: "Transaction finalized",
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

//function to generate transaction ID.you can modify it as needed
async function generateTransID() {
	let number = await Transaction.countDocuments();
	number++;
	return "TRX" + number;
}
