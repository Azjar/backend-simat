const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// get task based on query yang diberikan user
exports.getTasks = async ({ user, query }) => {
  // ambil query dari frontend
  const {
    status = "all",
    priority = "all",
    assignee = "all",
    showHidden = "0",
  } = query;

  const where = {};

  // default: task hidden tidak ditampilkan, kecuali fe manggil showhidden = 1
  if (showHidden !== "1") {
    where.is_hidden = false;
  }

  // filter status
  if (status !== "all") 
    where.status = status;

  const normalizePriority = (p) => {
    const v = (p || "").toLowerCase().trim();
    if (v === "high") return "High";
    if (v === "medium") return "Medium";
    if (v === "low") return "Low";
    return p; // fallback
  };

  // filter prioriy
  if (priority !== "all") 
    where.priority = normalizePriority(priority);

  // dev hanya boleh lihat task miliknya sendiri
  if (user.role === "dev") {
    where.assignDevId = user.id;

  // QA bisa filter task berdasarkan assignee
  } else if (assignee !== "all") {
    where.assignDevId = Number(assignee);
  }

  // query db
  return prisma.task_management.findMany({
    where,
    include: {
      assignDev: { 
        select: { id: true, username: true } },
    },
    // urutkan dari task terbaru
    orderBy: { created_at: "desc" },
  });
};

exports.updateTaskStatus = async ({ taskId, userId, newStatus }) => {
  const allowed = ["To Do", "In Progress", "Done"];

  // validasi status dari frontend
  if (!allowed.includes(newStatus)) {
    const err = new Error("Invalid status");
    err.code = 400;
    throw err;
  }

  // ambil task based on task id & id dev (authorization)
  const task = await prisma.task_management.findFirst({
    where: {
      id: taskId,
      assignDevId: userId,
    },
  });

  // error
  if (!task) {
    const err = new Error("Task not found");
    err.code = 404;
    throw err;
  }

  // task yang sudah done, tidak bisa balik
  if (task.status === "Done" && newStatus !== "Done") {
    const err = new Error(
      "Completed assignments cannot be returned."
    );
    err.code = 400;
    throw err;
  }

  // update task di db
  return prisma.task_management.update({
    where: { id: taskId },
    data: { status: newStatus },
  });
};
