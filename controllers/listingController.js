const Listing = require("../models/Listing");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

exports.listing = async (req, res) => {
	try {
		let headline = req.query.headline;
		let pageNumber = req.query.page;

		if (pageNumber === undefined) {
			pageNumber = 1;
		}

		let query = {};
		if (headline) {
			query.headline = { $regex: new RegExp(headline), $options: "i" };
		}

		//{_id:{ $lt:46100}}
		query._id = { $lt: 46100 };

		const rs = await Listing.paginate(query, {
			page: pageNumber,
			limit: 30,
			sort: { _id: 1 },
		});
		const rows = rs.docs;
		let listings = [];

		for (var i = 0; i < rows.length; i++) {
			listings[i] = {
				productid: rows[i]._id,
				sid: pageNumber + "-" + rows[i]._id.toString(),
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

exports.delete = async (req, res) => {
	const id = req.params.id;

	await Listing.findByIdAndDelete(id)
		.then((data) => {
			if (!data) {
				res.status(404).json({
					success: false,
					message: "Product not found",
				});
			} else {
				res.status(200).json({
					success: true,
					message: "Product deleted successfully!",
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
