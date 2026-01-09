const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET tasks 
router.get("/task-management", authMiddleware, async (req, res) => {
  try {
    const { status = "all", priority = "all", assignee = "all" } = req.query;

    const where = {};

    // filter status/priority
    if (status !== "all") where.status = status;
    if (priority !== "all") where.priority = priority;

    if (req.user.role === "dev") {
      // DEV cuma lihat yang assignDev = username dia
      where.assignDev = req.user.username;
    } else {
      // QA boleh filter assignee dari dropdown
      if (assignee !== "all") where.assignDev = assignee;
    }

    const tasks = await prisma.task_management.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil task management" });
  }
});

module.exports = router;