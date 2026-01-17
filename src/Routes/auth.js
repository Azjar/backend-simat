const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const userController = require("../controllers/userController");

router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/me", authMiddleware, userController.me);
router.put("/edit-profile", authMiddleware, userController.updateProfile);

module.exports = router;
