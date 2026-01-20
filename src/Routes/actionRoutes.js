const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const requireQA = require("../Middleware/requireQA");
// Controller untuk reopen dan complete task
const {
  completeTaskController,
  reopenTaskController,
} = require("../Controllers/actionController");

// REOPEN ROUTE
router.patch(
  "/tasks/:id/reopen",
  authMiddleware, // cek token & set req.user
  requireQA, // cek role user dari req.user (harus QA)
  reopenTaskController // controller reopen task
);

// COMPLETE
router.patch(
  "/tasks/:id/complete",
  authMiddleware, // cek token & set req.user
  requireQA, // cek role user dari req.user (harus QA)
  completeTaskController // controller complete task
);

module.exports = router;
