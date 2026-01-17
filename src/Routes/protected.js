const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const role = require("../Middleware/role");
const userController = require("../Controllers/userController");
const prisma = require("../utils/prisma");

// hanya QA yang boleh
router.get("/dashboard", auth, role("qa"), (req, res) => {
  res.json({ message: "Dashboard khusus QA" });
});

// QA & developer boleh
router.get("/suites", auth, role("qa", "developer"), (req, res) => {
  res.json({ message: "Data suites" });
});

// Ambil User dengan role developer
router.get(
  "/developers",
  auth,
  userController.getDevelopers
);


module.exports = router;
