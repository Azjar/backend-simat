const { readAllureResults } = require("../utils/allureReader");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { saveAllureScreenshot } = require("../utils/saveScreenshot");
const { getScreenshotFromTest } = require("../utils/allureScreenshot");
const path = require("path");

const ALLURE_RESULT_DIR = process.env.ALLURE_RESULTS_PATH;

async function syncAllureToDatabase() {
  if (!ALLURE_RESULT_DIR) throw new Error("ALLURE_RESULTS_PATH belum di-set di .env");

  const results = readAllureResults();

  // HITUNG SUMMARY
  const totalPass = results.filter(r => r.status === "passed").length;
  const totalFail = results.filter(r => r.status === "failed").length;
  const totalBroken = results.filter(r => r.status === "broken").length;
  const status = totalFail > 0 ? "FAILED" : "PASSED";

  // UPSERT test_run (ALL)
  const testRun = await prisma.test_run.upsert({
    where: {
      scope_scopeValue: {
        scope: "ALL",
        scopeValue: "ALL",
      },
    },
    update: {
      totalPass,
      totalFail,
      status,
      executedAt: new Date(),
      allureUrl: "/job/eksekusi-ulang/allure",
    },
    create: {
      scope: "ALL",
      scopeValue: "ALL",
      totalPass,
      totalFail,
      status,
      executedAt: new Date(),
      allureUrl: "/job/eksekusi-ulang/allure",
    },
  });


  for (const test of results) {
    const suiteLabel = test.labels?.find(l => l.name === "suite");
    const suiteName = suiteLabel?.value || "UNKNOWN";

    const fileLabel = test.labels?.find(l => l.name === "file");
    const specPath = fileLabel?.value || test.fullName || null;

    const durationMs = test.stop && test.start ? test.stop - test.start : 0;
    const errorMessage = ["failed", "broken"].includes(test.status) ? test.statusDetails?.message || test.statusDetails?.trace || null : null;

    // Ambil screenshot
    const screenshotFileName = getScreenshotFromTest(test);

    if (screenshotFileName) {
      saveAllureScreenshot(ALLURE_RESULT_DIR, screenshotFileName);
    }
    // Update DB
    await prisma.test_specs.upsert({
      where: {
        specPath_testName: {
          specPath,
          testName: test.name,
        },
      },
      update: {
        suiteName,
        testName: test.name,
        status: test.status.toUpperCase(),
        durationMs,
        errorMessage,
        screenshotUrl: screenshotFileName ? path.basename(screenshotFileName) : null,
        specPath,
        lastRunAt: new Date(),
        runId: testRun.id,
      },
      create: {
        testCaseId: test.testCaseId,
        suiteName,
        testName: test.name,
        status: test.status.toUpperCase(),
        durationMs,
        errorMessage,
        screenshotUrl: screenshotFileName ? path.basename(screenshotFileName) : null,
        specPath,
        lastRunAt: new Date(),
        runId: testRun.id,
      },
    });
  }

  console.log("✅ Allure sync finished!");
  return { total: results.length, totalPass, totalFail, totalBroken };
}

module.exports = { syncAllureToDatabase };
