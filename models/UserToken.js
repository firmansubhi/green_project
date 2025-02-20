const mongoose = require("mongoose");

const userTokenSchema = new mongoose.Schema({
	userId: String,
	token: String,
	expiredDate: Date,
	createdAt: { type: Date, default: Date.now },
	updatedAt: Date,
});

module.exports = mongoose.model("UserToken", userTokenSchema);
