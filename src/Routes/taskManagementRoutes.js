const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const { getTasksController, updateTaskStatusController } = require("../Controllers/taskManagementController");

// GET semua task (filter via query)
router.get(
  "/task-management",
  authMiddleware, // cek token & set req.user
  getTasksController // controller get task
);

// UPDATE status task
router.patch(
  "/task-management/:id/status",
  authMiddleware,
  updateTaskStatusController
);

module.exports = router;
