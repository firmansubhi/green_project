// routes/news.js
const express = require("express");
const newsController = require("../controllers/newsController");
const router = express.Router();
const { tokenCheck } = require("../middlewares/authMiddleware");

router.get("/all", tokenCheck(["administrator"]), newsController.all);
router.get("/browse", newsController.browse);
router.get(
	"/categories",
	tokenCheck(["administrator"]),
	newsController.categories
);

router.get("/banner", newsController.banner);
router.get("/:id", tokenCheck(["administrator"]), newsController.single);
router.get("/group/all", newsController.viewg);
router.get("/category/:category", newsController.category);

router.get("/view/:id", newsController.view);
router.post("/add", tokenCheck(["administrator"]), newsController.add);
router.post("/edit", tokenCheck(["administrator"]), newsController.edit);
router.delete("/:id", tokenCheck(["administrator"]), newsController.delete);

module.exports = router;
