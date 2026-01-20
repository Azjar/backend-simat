// Util untuk membaca & parsing hasil Allure (JSON → array test case)
const { readAllureResults } = require("../utils/allureReader");

// Prisma Client untuk akses database
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Util untuk mencari file screenshot dari object test Allure sekaligus menyimpannya
const { getScreenshotFromTest, saveAllureScreenshot  } = require("../utils/allureScreenshot");

const path = require("path");

// Path folder allure-results (diambil dari .env)
const ALLURE_RESULT_DIR = process.env.ALLURE_RESULTS_PATH;

/**
 * Untuk melakukan sinkronisasi hasil test Allure ke dalam database
 */
async function syncAllureToDatabase() {
  // Validasi konfigurasi environment
  if (!ALLURE_RESULT_DIR) {
    throw new Error(
      "ALLURE_RESULTS_PATH hasn't been configured in the .env file."
    );
  }

  /** Baca & parsing hasil Allure **/
  const results = readAllureResults();

  /** Hitung summary hasil test */
  const totalPass = results.filter(r => r.status === "passed").length;
  const totalFail = results.filter(r => r.status === "failed").length;
  const totalBroken = results.filter(r => r.status === "broken").length;

  const status =
    totalFail + totalBroken > 0 ? "FAILED" : "PASSED";

  /** Upsert data test_run */
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

  /** Loop seluruh test case hasil Allure */
  for (const test of results) {

    // Ambil suiteName dari label Allure
    const suiteLabel = test.labels?.find(l => l.name === "suite");
    const suiteName = suiteLabel?.value || "UNKNOWN";

    // Identitas spec file
    const fileLabel = test.labels?.find(l => l.name === "file");
    const specPath =
      fileLabel?.value || test.fullName || "UNKNOWN_SPEC";

    // Informasi dasar test
    const testName = test.name || "UNKNOWN_TEST";
    const statusUpper =
      (test.status || "unknown").toUpperCase();

    // Durasi test (ms)
    const durationMs =
      test.stop && test.start ? test.stop - test.start : 0;

    // Error message hanya untuk FAILED / BROKEN
    const errorMessage =
      ["failed", "broken"].includes(test.status || "")
        ? test.statusDetails?.message ||
          test.statusDetails?.trace ||
          null
        : null;

    /** Handle screenshot attachment (jika ada) */
    const screenshotFileName = getScreenshotFromTest(test);

    if (screenshotFileName) {
      saveAllureScreenshot(
        ALLURE_RESULT_DIR,
        screenshotFileName
      );
    }

    /** Upsert test_specs (per test case) */
    await prisma.test_specs.upsert({
      where: {
        specPath_testName: {
          specPath,
          testName,
        },
      },
      update: {
        suiteName,
        testName,
        status: statusUpper,
        durationMs,
        errorMessage,
        screenshotUrl: screenshotFileName
          ? path.basename(screenshotFileName)
          : null,
        specPath,
        lastRunAt: new Date(),
        runId: testRun.id,
      },
      create: {
        testCaseId: test.testCaseId,
        suiteName,
        testName,
        status: statusUpper,
        durationMs,
        errorMessage,
        screenshotUrl: screenshotFileName
          ? path.basename(screenshotFileName)
          : null,
        specPath,
        lastRunAt: new Date(),
        runId: testRun.id,
      },
    });
  }

  console.log("✅ Allure sync finished!");

  // Return summary untuk response API
  return {
    total: results.length,
    totalPass,
    totalFail,
    totalBroken,
  };
}

module.exports = { syncAllureToDatabase };
