const express = require("express");
const router = express.Router();
const auth = require("../Middleware/auth");
const role = require("../Middleware/role");

// hanya QA yang boleh
router.get("/dashboard", auth, role("qa"), (req, res) => {
  res.json({ message: "Dashboard khusus QA" });
});

// QA & developer boleh
router.get("/suites", auth, role("qa", "developer"), (req, res) => {
  res.json({ message: "Data suites" });
});

module.exports = router;
