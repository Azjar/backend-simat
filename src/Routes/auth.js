const express = require("express");
const   router = express.Router();
const authMiddleware = require("../Middleware/auth");
const { login, logout, me, updateProfile } = require("../Controllers/userController");

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);
router.put("/edit-profile", authMiddleware, updateProfile);

module.exports = router;
