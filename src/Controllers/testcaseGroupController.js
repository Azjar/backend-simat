// Utility untuk menentukan parent test case berdasarkan suiteName
// Contoh: "AT-CORE-0013-01" → "AT-CORE-0013"
const { getParentTestCase } = require("../utils/groupTestcase");

// Prisma Client untuk akses database
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getGroupedTestCases = async (req, res) => {
  try {
    // Ambil informasi user dari auth middleware
    const { role, id: userId } = req.user;

    /**
     * Ambil task
     * DEV hanya melihat task yang di-assign ke dirinya
     * Task yang di-hidden tidak diikutsertakan
     */
    const tasks = await prisma.task_management.findMany({
      where:
        role === "dev"
          ? {
              assignDevId: userId,
              is_hidden: false,
            }
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

    // Jika role DEV tapi tidak memiliki task, kembalikan array kosong
    if (role === "dev" && tasks.length === 0) {
      return res.json([]);
    }

    // Mengelompokkan task berdasarkan suiteName
    const taskBySuiteName = new Map();
    for (const task of tasks) {
      if (!taskBySuiteName.has(task.suiteName)) {
        taskBySuiteName.set(task.suiteName, task);
      }
    }

    /**
     * Ambil test_specs
     * - DEV hanya mengambil test case yang suite-nya ada pada task miliknya
     */
    const tests = await prisma.test_specs.findMany({
      where:
        role === "dev"
          ? {
              suiteName: {
                in: Array.from(taskBySuiteName.keys()),
              },
            }
          : {},
      orderBy: { suiteName: "asc" },
    });

    // Grouping test case berdasarkan parent suite
    const grouped = {};

    for (const test of tests) {
      // Ambil parent suite code
      const parent = getParentTestCase(test.suiteName);

      // Inisialisasi group jika belum ada
      if (!grouped[parent]) {
        grouped[parent] = {
          parentCode: parent,
          totalTests: 0,
          passed: 0,
          failed: 0,
          broken: 0,
          testCases: [],
        };
      }

      // Ambil task yang sesuai dengan suite test case
      const task = taskBySuiteName.get(test.suiteName);

      // Push test case + metadata task
      grouped[parent].testCases.push({
        ...test,
        taskStatus: task?.status || "",
        taskId: task?.id || null,
        assignDev: task?.assignDev || null,
      });

      // Hitung statistik test
      grouped[parent].totalTests++;
      if (test.status === "PASSED") grouped[parent].passed++;
      if (test.status === "FAILED") grouped[parent].failed++;
      if (test.status === "BROKEN") grouped[parent].broken++;
    }

    /**
     * Mengurutkan test case di dalam setiap group
     * berdasarkan suiteName
     */
    Object.values(grouped).forEach((group) =>
      group.testCases.sort((a, b) =>
        a.suiteName.localeCompare(b.suiteName)
      )
    );

    // Return hasil grouping sebagai array
    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to get grouped test cases",
    });
  }
};

module.exports = { getGroupedTestCases };
