const { PrismaClient } = require("@prisma/client");
const { getParentTestCase } = require("../utils/groupTestcase");

const prisma = new PrismaClient();

const getGroupedTestCases = async (req, res) => {
  try {
    const tests = await prisma.test_specs.findMany({
      orderBy: { suiteName: "asc" }
    });

     // ambil semua task sekaligus (biar gak N+1 query)
    const tasks = await prisma.task_management.findMany({
      orderBy: { updated_at: "desc" }, // kalau ada multiple, yang terbaru kepilih
    });

    // bikin map: suiteName -> task terbaru
    const taskBySuiteName = new Map();
    for (const t of tasks) {
      // kalau belum ada, set. Kalau sudah ada berarti sudah kepilih yg terbaru 
      if (!taskBySuiteName.has(t.suiteName)) {
        taskBySuiteName.set(t.suiteName, t);
      }
    }

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
      });

      grouped[parent].totalTests++;

      if (test.status === "PASSED") grouped[parent].passed++;
      if (test.status === "FAILED") grouped[parent].failed++;
      if (test.status === "BROKEN") grouped[parent].broken++;
    }

    // Sort child testCases biar urut 01,02,03
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
