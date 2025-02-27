const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const { tokenCheck } = require("../middlewares/authMiddleware");

// Define routes
router.get("/all", tokenCheck(["administrator"]), userController.all);
router.get("/showall", tokenCheck(["administrator"]), userController.showall);
router.get(
	"/myprofile",
	tokenCheck(["seller", "receiver", "buyer", "administrator"]),
	userController.myProfile
);
router.get(
	"/mypoin",
	tokenCheck(["seller", "receiver", "buyer", "administrator"]),
	userController.myPoin
);
router.get("/:id", tokenCheck(["administrator"]), userController.single);
router.get("/listing", tokenCheck(["administrator"]), userController.listing);
router.post("/add", tokenCheck(["administrator"]), userController.add);
router.post("/edit", tokenCheck(["administrator"]), userController.edit);
router.delete("/:id", tokenCheck(["administrator"]), userController.delete);

// Export the router
module.exports = router;
