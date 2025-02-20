const Product = require("../models/Product");
require("dotenv").config();

exports.all = async (req, res) => {
	try {
		let name = req.query.name;

		let query = {};
		if (name) {
			query.name = { $regex: new RegExp(name), $options: "i" };
		}

		const rows = await Product.find(query);
		let data = [];

		data[0] = {
			id: "-",
			name: "Select Product",
			price: 0,
		};

		for (var i = 0; i < rows.length; i++) {
			data[i + 1] = {
				id: rows[i]._id.toString(),
				name: rows[i].name,
				price: rows[i].price,
			};
		}

		const r = {
			rows: data,
		};

		res.status(200).json({ success: true, data: r });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.single = async (req, res) => {
	const id = req.params.id;

	try {
		const row = await Product.findById(id);
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
	const { name, price } = req.body;

	// Validate input
	if (!name || !price) {
		return res.status(404).json({
			success: false,
			message: "Name and price are required.",
		});
	}

	const newProduct = new Product({
		name: name,
		price: price,
	});

	try {
		await newProduct.save();
		res.status(200).json({
			success: true,
			message: "Product inserted successfully.",
		});
	} catch (error) {
		res.status(500).json({
			success: true,
			error: "An error occurred while saving your request.",
		});
	}
};

exports.edit = async (req, res) => {
	const { _id, name, price } = req.body;

	// Validate input
	if (!name || !price) {
		return res.status(404).json({
			success: false,
			message: "Name and price are required.",
		});
	}

	await Product.findByIdAndUpdate(_id, req.body, {
		useFindAndModify: false,
	})
		.then((data) => {
			if (!data) {
				res.status(404).json({
					success: false,
					message: "Product not found.",
				});
			} else {
				res.status(200).json({
					success: true,
					message: "Product updated successfully.",
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

	await Product.findByIdAndDelete(id)
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
