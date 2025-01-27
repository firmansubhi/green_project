const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

const { tokenCheck } = require("../middlewares/authMiddleware");

// Define routes
router.get(
	"/all",
	tokenCheck(["seller", "receiver", "buyer", "administrator"]),
	productController.all
);
router.get("/:id", tokenCheck(["administrator"]), productController.single);
router.post("/add", tokenCheck(["administrator"]), productController.add);
router.post("/edit", tokenCheck(["administrator"]), productController.edit);
router.delete("/:id", tokenCheck(["administrator"]), productController.delete);

// Export the router
module.exports = router;
