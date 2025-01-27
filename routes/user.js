const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

const { tokenCheck } = require("../middlewares/authMiddleware");

// Define routes
router.get("/all", tokenCheck(["administrator"]), userController.all);
router.get("/:id", tokenCheck(["administrator"]), userController.single);
router.post("/add", tokenCheck(["administrator"]), userController.add);
router.post("/edit", tokenCheck(["administrator"]), userController.edit);
router.delete("/:id", tokenCheck(["administrator"]), userController.delete);

// Export the router
module.exports = router;
