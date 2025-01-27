const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const userSchema = new mongoose.Schema({
	username: String,
	role: String,
	firstname: String,
	lastname: String,
	email: String,
	city: String,
});

const productSchema = new mongoose.Schema({
	name: String,
	price: Number,
});

const transactionSchema = new mongoose.Schema({
	transID: String,
	seller: userSchema,
	receiver: userSchema,
	buyer: userSchema,
	product: productSchema,
	sellerUsername: String,
	receiverUsername: String,
	buyerUsername: String,
	weight: { type: Number, required: true },
	status: {
		type: String,
		default: "pending",
		enum: ["pending", "finalized", "approved", "paid"],
	},
	adminApproved: { type: Boolean, default: false },
	amount: { type: Number, required: false },
	createdAt: { type: Date, default: Date.now },
	updatedAt: Date,
	finalizedAt: Date,
	approvedAt: Date,
	paidAt: Date,
});

transactionSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Transaction", transactionSchema);
