const mongoose = require("mongoose");
const moment = require("moment");
const News = require("../models/News");
const User = require("../models/User");
require("dotenv").config();
const sharp = require("sharp");
const fs = require("fs");

exports.all = async (req, res) => {
	try {
		//get query string from frontend
		let title = req.query.title;
		let content = req.query.content;
		let pageNumber = req.query.page;

		//if page number is undefined. set to 1
		if (pageNumber === undefined) {
			pageNumber = 1;
		}

		//define empty filter
		let query = {};

		//if search title not empty, add filter
		if (title) {
			query.title = { $regex: new RegExp(title), $options: "i" };
		}

		//if search content not empty, add filter
		if (content) {
			query.content = { $regex: new RegExp(content), $options: "i" };
		}

		//get data from database
		const rs = await News.paginate(query, {
			page: pageNumber,
			limit: 10,
		});
		const rows = rs.docs;

		//define empty data
		let data = [];

		for (var i = 0; i < rows.length; i++) {
			//append database row to data
			data[i] = {
				id: rows[i]._id.toString(),
				newsID: rows[i].newsID,
				creator: rows[i].creator,
				title: rows[i].title,
				intro: rows[i].intro,
				content: rows[i].content,
				publishDate: moment(rows[i].publishDate).format(
					"ddd, D MMM YY HH:mm"
				),
				createdAt: moment(rows[i].createdAt).format(
					"ddd, D MMM YY HH:mm"
				),
			};
		}

		//data to be sent to the frontend
		const r = {
			rows: data,
			totalDocs: rs.totalDocs,
			limit: rs.limit,
			totalPages: rs.totalPages,
			page: rs.page,
			pagingCounter: rs.pagingCounter,
			hasPrevPage: rs.hasPrevPage,
			hasNextPage: rs.hasNextPage,
			prevPage: rs.prevPage,
			nextPage: rs.nextPage,
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
		const row = await News.findById(id);

		let data = {
			_id: row._id,
			newsID: row.newsID,
			title: row.title,
			intro: row.intro,
			content: row.content,
			imagePath: row.imagePath,
			publishDate: moment(row.publishDate).format("YYYY-MM-DD HH:MM"),
			createdAt: moment(row.createdAt).format("yyyy-mm-dd hh:mm"),
		};

		//sent data to the frontend
		res.status(200).json({
			success: true,
			data: data,
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
	const { title, intro, content, publishDate } = req.body;

	//get request data from tokenCheck function
	const userid = req.userid;

	// Validate input
	if (!title || !intro || !content || !publishDate) {
		return res.status(404).json({
			success: false,
			message: "All data are required.",
		});
	}

	try {
		//get creator data from database
		const creator = await User.findById(userid);

		//create generated news ID
		const newsID = await generateNewsID(title);

		//set saved data
		const newNews = new News({
			newsID: newsID,
			creator: creator,
			title: title,
			intro: intro,
			content: content,
			publishDate: publishDate,
			createdAt: new Date(),
		});

		try {
			//saving data to the database
			await newNews.save();

			//if using image
			if (req.files) {
				let image = req.files.image;
				let ext = ".jpg";

				if (image.mimetype == "image/png") {
					ext = ".png";
				}

				let imagePath = "news_image/" + newsID + ext;
				let newImagePath = "news_image/" + newsID + ".webp";

				//save uploaded image
				await image.mv(process.env.BASE_IMAGE_PATH + "/" + imagePath);

				//resize image
				sharp(process.env.BASE_IMAGE_PATH + "/" + imagePath)
					.resize({ width: 750, height: 500 })
					.toFile(
						process.env.BASE_IMAGE_PATH + "/" + newImagePath,
						(err, info) => {
							fs.unlink(
								process.env.BASE_IMAGE_PATH + "/" + imagePath,
								(err) => {
									if (err) {
										console.error(
											"An error occurred:",
											err
										);
									}
								}
							);
						}
					);

				//update imagePath in monogdb
				await News.updateOne(
					{ newsID: newsID },
					{ imagePath: newImagePath }
				);
			}

			res.status(200).json({
				success: true,
				message: "news created",
			});
		} catch (error) {
			console.log(error);
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

	const { _id, newsID, title, intro, content, publishDate } = req.body;
	//let isImage = false;
	//if (!req.files) {
	//	isImage = true;
	//}

	//create object ID for mongoDB based on given ID (_id)
	let currentID = mongoose.Types.ObjectId.createFromHexString(_id);

	// Validate input
	if (!title || !intro || !content || !publishDate) {
		return res.status(404).json({
			success: false,
			message: "All data are required.",
		});
	}

	try {
		try {
			//update data
			await News.updateOne(
				{ _id: currentID },
				{
					newsID: newsID,
					title: title,
					intro: intro,
					content: content,
					publishDate: publishDate,
					updatedAt: new Date(),
				}
			);

			if (req.files) {
				let image = req.files.image;
				let ext = ".jpg";

				if (image.mimetype == "image/png") {
					ext = ".png";
				}

				let imagePath = "news_image/" + newsID + ext;
				let newImagePath = "news_image/" + newsID + ".webp";

				await image.mv(process.env.BASE_IMAGE_PATH + "/" + imagePath);

				sharp(process.env.BASE_IMAGE_PATH + "/" + imagePath)
					.resize({ width: 750, height: 500 })
					.toFile(
						process.env.BASE_IMAGE_PATH + "/" + newImagePath,
						(err, info) => {
							fs.unlink(
								process.env.BASE_IMAGE_PATH + "/" + imagePath,
								(err) => {
									if (err) {
										console.error(
											"An error occurred:",
											err
										);
									}
								}
							);
						}
					);

				await News.updateOne(
					{ _id: currentID },
					{ imagePath: newImagePath }
				);
			}

			res.status(200).json({
				success: true,
				message: "Data updated",
			});
		} catch (error) {
			res.status(500).json({
				success: error,
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
	await News.findByIdAndDelete(id)
		.then((data) => {
			if (!data) {
				res.status(404).json({
					success: false,
					message: "News not found",
				});
			} else {
				res.status(200).json({
					success: true,
					message: "News deleted successfully!",
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

exports.browse = async (req, res) => {
	try {
		//get query string from frontend
		let pageNumber = req.query.page;

		//if page number is undefined. set to 1
		if (pageNumber === undefined) {
			pageNumber = 1;
		}

		//get data from database
		const rs = await News.paginate(
			{},
			{
				page: pageNumber,
				limit: 3,
			}
		);
		const rows = rs.docs;

		//define empty data
		let data = [];

		for (var i = 0; i < rows.length; i++) {
			//append database row to data
			data[i] = {
				newsID: rows[i].newsID,
				title: rows[i].title,
				intro: rows[i].intro,
				imagePath: rows[i].imagePath,
				publishDate: moment(rows[i].publishDate).format(
					"ddd, D MMM YY HH:mm"
				),
			};
		}

		//data to be sent to the frontend
		const r = {
			rows: data,
			totalDocs: rs.totalDocs,
			limit: rs.limit,
			totalPages: rs.totalPages,
			page: rs.page,
			pagingCounter: rs.pagingCounter,
			hasPrevPage: rs.hasPrevPage,
			hasNextPage: rs.hasNextPage,
			prevPage: rs.prevPage,
			nextPage: rs.nextPage,
		};

		//sent data to the frontend
		res.status(200).json({ success: true, data: r });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.view = async (req, res) => {
	//get ID from URL parameter
	const id = req.params.id;

	try {
		//get data from database
		const row = await News.findOne({
			newsID: id,
		});

		let data = {
			title: row.title,
			intro: row.intro,
			content: row.content,
			imagePath: row.imagePath,
			creator: row.creator.firstname,
			publishDate: moment(row.publishDate).format("ddd, D MMM YY HH:mm"),
		};

		//sent data to the frontend
		res.status(200).json({
			success: true,
			data: data,
		});
	} catch (error) {
		res.status(404).json({
			success: false,
			message: error.message,
		});
	}
};
//function to generate news ID.you can modify it as needed
async function generateNewsID(title) {
	const a = title.trim().replace(/\s+/g, " ");

	const b = a
		.toLowerCase()
		.replace(/ /g, "-")
		.replace(/[^\w-]+/g, "");

	return moment().format("hhmmss") + "-" + b;
}
