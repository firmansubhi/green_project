const mongoose = require("mongoose");
const moment = require("moment");
const News = require("../models/News");
const NewsCategories = require("../models/NewsCategories");
const User = require("../models/User");
require("dotenv").config();
const sharp = require("sharp");
const fs = require("fs/promises");

exports.all = async (req, res) => {
	//console.log(crypto.randomBytes(32).toString("hex"));

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
		let categoryName = "";
		for (var i = 0; i < rows.length; i++) {
			if (rows[i].category) {
				categoryName = rows[i].category.name;
			} else {
				categoryName = "";
			}

			//append database row to data
			data[i] = {
				id: rows[i]._id.toString(),
				newsID: rows[i].newsID,
				creator: rows[i].creator,
				categoryName: categoryName,
				title: rows[i].title,
				intro: rows[i].intro,
				imagePath: "https://tempdev2.roomie.id/" + rows[i].imagePath,
				imageThumb: "https://tempdev2.roomie.id/" + rows[i].imageThumb,
				publishDate: moment(rows[i].publishDate).format(
					"ddd, D MMM YY HH:mm"
				),
				createdAt: moment(rows[i].createdAt).format(
					"ddd, D MMM YY HH:mm"
				),
				publishDate2: moment(rows[i].publishDate).format(),
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
			countDoc: i,
		};

		//sent data to the frontend
		res.status(200).json({ success: true, data: r });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.viewg = async (req, res) => {
	try {
		const rows = await NewsCategories.find();
		let data = [];

		let rowsd;

		for (var i = 0; i < rows.length; i++) {
			data[i] = {
				id: rows[i]._id,
				name: rows[i].name,
				detail: [],
			};

			rowsd = await News.find({
				categoryId: rows[i]._id,
			}).sort({ publishDate: -1 });

			for (var j = 0; j < rowsd.length; j++) {
				data[i].detail[j] = {
					sid: rowsd[j]._id.toString(),
					imageThumb:
						"https://tempdev2.roomie.id/" + rowsd[j].imageThumb,
					title: rowsd[j].title,
					intro: rowsd[j].intro,
					newsID: rowsd[j].newsID,
					publishDate: moment(rowsd[j].publishDate).format(
						"ddd, D MMM YY"
					),
				};
			}
		}

		//sent data to the frontend
		res.status(200).json({ success: true, data: data });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.category = async (req, res) => {
	try {
		const category = req.params.category;

		const rows = await News.find({ categoryId: category })
			.sort({
				publishDate: -1,
			})
			.limit(6);
		let data = [];
		let data2 = [];

		let no = 0;
		let y = 0;
		let j = 0;
		for (var i = 0; i < rows.length; i++) {
			no++;

			data2[j] = {
				newsID: rows[i].newsID,
				imageThumb: "https://tempdev2.roomie.id/" + rows[i].imageThumb,
				title: rows[i].title,
				publishDate: moment(rows[i].publishDate).format("ddd, D MMM"),
			};

			if (no % 2 == 0) {
				data[y] = data2;
				y++;
				j = 0;
				data2 = [];
			} else {
				j++;
			}
		}

		//sent data to the frontend
		res.status(200).json({ success: true, data: data });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};

exports.categories = async (req, res) => {
	try {
		const rows = await NewsCategories.find({});
		let data = [];

		data[0] = {
			id: "-",
			name: "Select Category",
			price: 0,
		};

		for (var i = 0; i < rows.length; i++) {
			data[i + 1] = {
				id: rows[i]._id,
				name: rows[i].name,
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
	//get ID from URL parameter
	const id = req.params.id;

	try {
		//get data from database
		const row = await News.findById(id);

		let imageThumb = "";

		if (row.imageThumb) {
			imageThumb = "https://tempdev2.roomie.id/" + row.imageThumb;
		}

		let data = {
			_id: row._id,
			newsID: row.newsID,
			title: row.title,
			intro: row.intro,
			content: row.content,
			imagePath: row.imagePath,
			imageThumb: imageThumb,
			category: row.category,
			publishDate: moment(row.publishDate).format("YYYY-MM-DD HH:mm"),
			publishDate2: moment(row.publishDate).format(
				"YYYY-MM-DDTHH:mm:ssZ"
			),
			createdAt: moment(row.createdAt).format("yyyy-mm-dd hh:mm"),
			publishDate2: moment(row.publishDate).format("YYYY-MM-DD HH:mm:ss"),
			categoryId: row.categoryId,
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
	const { title, intro, content, publishDate, category } = req.body;

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

		const selectedCategory = await NewsCategories.findById(category);

		//set saved data
		const newNews = new News({
			newsID: newsID,
			creator: creator,
			category: selectedCategory,
			categoryId: selectedCategory._id,
			categoryName: selectedCategory.name,
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
				let newImageThumb = "news_image/" + newsID + "-thumb.webp";

				//save uploaded image
				await image.mv(process.env.BASE_IMAGE_PATH + "/" + imagePath);

				//resize image
				sharp(process.env.BASE_IMAGE_PATH + "/" + imagePath)
					.resize({ width: 1024, height: 870 })
					.toFile(
						process.env.BASE_IMAGE_PATH + "/" + newImagePath,
						(err, info) => {
							sharp(process.env.BASE_IMAGE_PATH + "/" + imagePath)
								.resize({ width: 450, height: 408 })
								.toFile(
									process.env.BASE_IMAGE_PATH +
										"/" +
										newImageThumb,
									(err, info) => {
										fs.unlink(
											process.env.BASE_IMAGE_PATH +
												"/" +
												imagePath,
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
						}
					);

				//update imagePath in monogdb
				await News.updateOne(
					{ newsID: newsID },
					{ imagePath: newImagePath, imageThumb: newImageThumb }
				);
			}

			res.status(200).json({
				success: true,
				message: "news created",
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

	const { _id, newsID, title, intro, content, publishDate, category } =
		req.body;

	//create object ID for mongoDB based on given ID (_id)
	let currentID = mongoose.Types.ObjectId.createFromHexString(_id);

	// Validate input
	if (!title || !intro || !content || !publishDate) {
		return res.status(404).json({
			success: false,
			message: "All data are required.",
		});
	}

	const selectedCategory = await NewsCategories.findById(category);

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
					category: selectedCategory,
					categoryId: selectedCategory._id,
					categoryName: selectedCategory.name,
					updatedAt: new Date(),
				}
			);

			if (req.files) {
				let ext = ".jpg";
				let picName = newsID + randomString(6);
				let imagePath = "news_image/" + picName + ext;
				let newImagePath = "news_image/" + picName + ".webp";
				let newImageThumb = "news_image/" + picName + "-thumb.webp";

				const old = await News.findOne({ _id: currentID });

				try {
					if (typeof old.imagePath !== "undefined") {
						fs.unlink(
							process.env.BASE_IMAGE_PATH + "/" + old.imagePath
						);
					}
					if (typeof old.imageThumb !== "undefined") {
						fs.unlink(
							process.env.BASE_IMAGE_PATH + "/" + old.imageThumb
						);
					}
				} catch (error) {
					console.log(error.message);
				}

				let image = req.files.image;

				if (image.mimetype == "image/png") {
					ext = ".png";
				}

				await image.mv(process.env.BASE_IMAGE_PATH + "/" + imagePath);

				try {
					sharp(process.env.BASE_IMAGE_PATH + "/" + imagePath)
						.resize({ width: 1024, height: 870 })
						.toFile(
							process.env.BASE_IMAGE_PATH + "/" + newImagePath,
							(err, info) => {
								sharp(
									process.env.BASE_IMAGE_PATH +
										"/" +
										imagePath
								)
									.resize({ width: 450, height: 408 })
									.toFile(
										process.env.BASE_IMAGE_PATH +
											"/" +
											newImageThumb,
										(err, info) => {
											try {
												fs.unlink(
													process.env
														.BASE_IMAGE_PATH +
														"/" +
														imagePath,
													(err) => {
														if (err) {
															console.error(
																"An error occurred:",
																err
															);
														}
													}
												);
											} catch (error) {
												console.log(error.message);
											}
										}
									);
							}
						);
				} catch (error) {
					console.log(error.message);
				}

				await News.updateOne(
					{ _id: currentID },
					{ imagePath: newImagePath, imageThumb: newImageThumb }
				);
			}

			res.status(200).json({
				success: true,
				message: "Data updated",
			});
		} catch (error) {
			res.status(500).json({
				success: false,
				message: error.message,
			});
		}
	} catch (error) {
		res.status(404).json({
			success: false,
			message: error.message,
		});
	}
};

function randomString(length) {
	let result = "";
	const characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
		counter += 1;
	}
	return result;
}

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
			imagePath: "https://tempdev2.roomie.id/" + row.imagePath,
			creator: row.creator.firstname,
			publishDate: moment(row.publishDate).format("ddd, D MMM YY HH:mm"),
			categoryName: row.categoryName,
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

exports.banner = async (req, res) => {
	try {
		data = [
			"https://tempdev2.roomie.id/images/banner/1.png",
			"https://tempdev2.roomie.id/images/banner/2.png",
			"https://tempdev2.roomie.id/images/banner/3.png",
		];

		res.status(200).json({ success: true, data: data });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};
