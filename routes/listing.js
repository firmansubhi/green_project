const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listingController");

const { tokenCheck } = require("../middlewares/authMiddleware");

// Define routes
router.get(
	"/listing",
	tokenCheck(["administrator"]),
	listingController.listing
);

// Export the router
module.exports = router;
