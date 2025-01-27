const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: {
		type: String,
		enum: ["seller", "receiver", "buyer", "administrator"],
		required: true,
	},
	qrCode: { type: String, unique: true },

	firstname: String,
	lastname: String,
	email: { type: String, unique: true },
	vcode: String,
	city: String,
	token: String,
});

userSchema.virtual("transactions", {
	ref: "Transaction",
	localField: "_id",
	foreignField: "memberId",
});

userSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("User", userSchema);
