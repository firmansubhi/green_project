// routes/transaction.js
const express = require("express");
const transactionController = require("../controllers/transactionController");
const router = express.Router();
const { tokenCheck } = require("../middlewares/authMiddleware");

router.get(
	"/scan-qr",
	tokenCheck(["seller"]),
	transactionController.scanQRCode
);

router.get(
	"/all",
	tokenCheck(["seller", "receiver", "buyer", "administrator"]),
	transactionController.all
);
router.get(
	"/:id",
	tokenCheck(["receiver", "buyer", "administrator"]),
	transactionController.single
);
router.post(
	"/add",
	tokenCheck(["receiver", "administrator"]),
	transactionController.add
);
router.post(
	"/edit",
	tokenCheck(["receiver", "administrator"]),
	transactionController.edit
);
router.delete(
	"/:id",
	tokenCheck(["receiver", "administrator"]),
	transactionController.delete
);

router.get(
	"/finalize/:id",
	tokenCheck(["buyer", "administrator"]),
	transactionController.finalizeGoods
);

module.exports = router;
