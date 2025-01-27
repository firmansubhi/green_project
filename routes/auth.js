const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

const { tokenCheck } = require("../middlewares/authMiddleware");

// Define routes
router.post("/login", authController.login);
router.post("/join", authController.joinMember);
router.post("/send-verification", authController.sendVerification);
router.post("/verify-code", authController.verifyCode);
router.get(
	"/test_login",
	tokenCheck(["seller", "receiver", "buyer", "administrator"]),
	authController.testLogin
);

// Export the router
module.exports = router;
