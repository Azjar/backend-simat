const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { login, logout, me, updateProfile } = require("../controllers/userController");

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);
router.put("/edit-profile", authMiddleware, updateProfile);

module.exports = router;
