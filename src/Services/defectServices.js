const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ACTIVE_STATUSES = ["To Do", "In Progress", "Done"];
// status yang artinya defect masih di-handle.

function normalizePriority(priority) {
  const v = (priority || "").toLowerCase().trim();
  if (v === "high") return "High";
  if (v === "medium") return "Medium";
  if (v === "low") return "Low";
  throw new Error("Priority tidak valid");
}

async function createDefect(payload) {
  const {
    testSpecId,
    testCaseId,
    title,
    assignDevId,
    priority,
    notes,
  } = payload;

  if (!title || !assignDevId || !priority) {
    throw new Error("Field title, assign developer, priority wajib diisi");
  }

  if (notes && notes.length > 255) {
    throw new Error("Notes maksimal 255 karakter");
  }

  if (!testSpecId && !testCaseId) {
    throw new Error("testSpecId atau testCaseId wajib dikirim");
  }

  const testSpec = await prisma.test_specs.findFirst({
    where: testSpecId
      ? { id: Number(testSpecId) }
      : { testCaseId },
    select: { suiteName: true },
  });

  if (!testSpec) {
    throw new Error("test_specs tidak ditemukan");
  }

  return prisma.task_management.create({
    data: {
      suiteName: testSpec.suiteName,
      title,
      assignDevId: Number(assignDevId),
      priority: normalizePriority(priority),
      status: "To Do",
      notes: notes?.trim() || "",
    },
  });
}

async function getActiveDefectByTestSpecId(testSpecId) {
  if (!testSpecId) throw new Error("testSpecId wajib dikirim");

  // ambil suiteName
  const testSpec = await prisma.test_specs.findFirst({
    where: { id: Number(testSpecId) },
    select: { suiteName: true },
  });

  if (!testSpec) return null;

  // cari defect aktif berdasarkan suiteName
  const activeDefect = await prisma.task_management.findFirst({
    where: {
      suiteName: testSpec.suiteName,
      status: { in: ACTIVE_STATUSES },
      is_hidden: false,  
    },
    select: {
      id: true, 
      assignDev: { select: { id: true, username: true } },
      priority: true,
      status: true,
      created_at: true, 
      updated_at: true, 

      reopenedAt: true,
      reopenedBy: true,
      reopened_by: { select: { id: true, username: true } },
    },
    orderBy: { id: "desc" },
  });

  return activeDefect;
}

module.exports = { createDefect, getActiveDefectByTestSpecId };