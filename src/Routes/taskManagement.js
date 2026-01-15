const express = require("express");
const router = express.Router();
const authMiddleware = require("../Middleware/auth");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET tasks 
router.get("/task-management", authMiddleware, async (req, res) => {
  try {
    const { status = "all", priority = "all", assignee = "all" } = req.query;

    const where = {
      is_hidden: false,
    };

    // filter status/priority
    if (status !== "all") where.status = status;
    if (priority !== "all") where.priority = priority;

    if (req.user.role === "dev") {
      // dev lihat task miliknya berdasarkan user.id
      where.assignDevId = req.user.id;
    } else {
      // QA boleh filter assignee dari dropdown
      if (assignee !== "all") where.assignDevId = Number(assignee);
    }

    const tasks = await prisma.task_management.findMany({
      where,
      include: {
        assignDev: { select: { id: true, username: true } },
      },
      orderBy: { created_at: "desc" },
    });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil task management" });
  }
});

// PATCH update status task
router.patch("/task-management/:id/status", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "dev") {
      return res.status(403).json({ message: "Hanya developer yang boleh update status" });
    }

    const id = Number(req.params.id);
    const { status: newStatus } = req.body;

    const allowed = ["To Do", "In Progress", "Done"];
    if (!allowed.includes(newStatus)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    // ambil task lama
    const task = await prisma.task_management.findFirst({
      where: {
        id,
        assignDevId: req.user.id,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task tidak ditemukan" });
    }

    // 🚫 RULE UTAMA
    if (task.status === "Done" && newStatus !== "Done") {
      return res.status(400).json({
        message: "Task yang sudah Done tidak boleh dikembalikan",
      });
    }

    await prisma.task_management.update({
      where: { id },
      data: { status: newStatus },
    });

    return res.json({ message: "Status updated" });
  } catch (err) {
    console.error("PATCH STATUS ERROR:", err);
    return res.status(500).json({ message: "Gagal update status task" });
  }
});



module.exports = router;