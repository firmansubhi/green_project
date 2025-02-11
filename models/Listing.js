const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const listingSchema = new mongoose.Schema({
	_id: Number,
	propertytype: String,
	headline: String,
	price: Number,
});

listingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Listing", listingSchema);
