const { PrismaClient } = require("@prisma/client");
const { getParentTestCase } = require("../utils/groupTestcase");

const prisma = new PrismaClient();

const getGroupedTestCases = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    // Ambil task dulu (karena DEV filter dari sini)
    const tasks = await prisma.task_management.findMany({
      where: role === "dev"
        ? { assignDevId: userId }
        : {},
      include: {
        assignDev: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { updated_at: "desc" },
    });

    // kalau DEV tapi tidak punya task → langsung kosong
    if (role === "dev" && tasks.length === 0) {
      return res.json([]);
    }

    // Map suiteName → task terbaru
    const taskBySuiteName = new Map();
    for (const t of tasks) {
      if (!taskBySuiteName.has(t.suiteName)) {
        taskBySuiteName.set(t.suiteName, t);
      }
    }

    // Ambil test_specs
    const tests = await prisma.test_specs.findMany({
      where: role === "dev"
        ? {
            suiteName: {
              in: Array.from(taskBySuiteName.keys())
            }
          }
        : {},
      orderBy: { suiteName: "asc" }
    });

    // Grouping 
    const grouped = {};

    for (const test of tests) {
      const parent = getParentTestCase(test.suiteName);

      if (!grouped[parent]) {
        grouped[parent] = {
          parentCode: parent,
          totalTests: 0,
          passed: 0,
          failed: 0,
          broken: 0,
          testCases: []
        };
      }

      const task = taskBySuiteName.get(test.suiteName);

      grouped[parent].testCases.push({
        ...test,
        taskStatus: task?.status || "",
        taskId: task?.id || null,
        assignDev: task?.assignDev || null
      });

      grouped[parent].totalTests++;
      if (test.status === "PASSED") grouped[parent].passed++;
      if (test.status === "FAILED") grouped[parent].failed++;
      if (test.status === "BROKEN") grouped[parent].broken++;
    }

    // Sort child
    Object.values(grouped).forEach(group =>
      group.testCases.sort((a, b) =>
        a.suiteName.localeCompare(b.suiteName)
      )
    );

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal grouping test case" });
  }
};

module.exports = { getGroupedTestCases };
