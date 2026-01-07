const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function createDefect(payload) {
  const {
    testSpecId,
    testCaseId,
    title,
    assignDev,
    priority,
    notes,
  } = payload;

  if (!title || !assignDev || !priority) {
    throw new Error("Field title, assign developer, priority wajib diisi");
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
      assignDev,
      priority,
      status: "To Do",
      notes: notes || "",
    },
  });
}

module.exports = { createDefect };