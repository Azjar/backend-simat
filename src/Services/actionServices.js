const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function reopenTask(taskId, userId) {
  const task = await prisma.task_management.findUnique({
    where: { id: Number(taskId) },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // hanya boleh reopen kalau status Done
  if (task.status !== "Done") {
    throw new Error("Task has not been marked as Done");
  }

  return prisma.task_management.update({
    where: { id: task.id },
    data: {
      status: "To Do",          // balikin ke To Do
      reopenedAt: new Date(),   // waktu reopen
      reopenedBy: userId,       // siapa yang reopen
    },
    include: {
      reopened_by: { select: { id: true, username: true } },
    },
  });
}

async function completeTask(taskId) {
  const task = await prisma.task_management.findUnique({
    where: { id: Number(taskId) },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.status !== "Done") {
    throw new Error("Task has not been marked as Done");
  }

  // soft hide
  return prisma.task_management.update({
    where: { id: task.id },
    data: {
      is_hidden: true,
      updated_at: new Date(),
    },
  });
}

module.exports = {
  reopenTask,
  completeTask,
};
