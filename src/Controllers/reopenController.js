const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// PATCH /api/tasks/:id/reopen
const reopenTaskController = async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const updated = await prisma.task_management.update({
      where: { id: taskId },
      data: {
        status: "To Do",
        reopenedAt: new Date(),
        reopenedBy: req.user.id,
      },
      include: {
        reopened_by: { select: { id: true, username: true } },
      },
    });

    return res.json({ data: updated });
  } catch (e) {
    console.error("REOPEN TASK ERROR:", e);
    return res.status(500).json({ message: "Failed to reopen task" });
  }
};

// PATCH /api/tasks/:id/complete 
const completeTaskController = async (req, res) => {
  try {
    const taskId = Number(req.params.id);

    const updated = await prisma.task_management.update({
      where: { id: taskId },
      data: {
        is_hidden: true,
      },
    });

    return res.json({ data: updated });
  } catch (e) {
    console.error("COMPLETE TASK ERROR:", e);
    return res.status(500).json({ message: "Failed to complete task" });
  }
};

module.exports = {
  reopenTaskController,
  completeTaskController,
};
