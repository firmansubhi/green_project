const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
	_id: String,
	name: String,
});

module.exports = mongoose.model("NewsCategories", categorySchema);
