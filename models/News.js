const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema({
	username: String,
	firstname: String,
	lastname: String,
});

const categorySchema = new mongoose.Schema({
	_id: String,
	name: String,
});

const newsSchema = new mongoose.Schema({
	newsID: String,
	imagePath: String,
	imageThumb: String,
	creator: userSchema,
	category: categorySchema,
	categoryId: String,
	categoryName: String,
	title: String,
	intro: String,
	content: String,
	publishDate: Date,
	createdAt: { type: Date, default: Date.now },
	updatedAt: Date,
});

newsSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("News", newsSchema);
