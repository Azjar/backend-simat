const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const requireQA = require("../Middleware/requireQA");

const {
  completeTaskController,
  reopenTaskController,
} = require("../Controllers/reopenController");

// REOPEN
router.patch(
  "/tasks/:id/reopen",
  authMiddleware,
  requireQA,
  reopenTaskController
);

// COMPLETE
router.patch(
  "/tasks/:id/complete",
  authMiddleware,
  requireQA,
  completeTaskController
);

module.exports = router;
