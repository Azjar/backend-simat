const { readAllureResults } = require("../utils/allureReader"); //  baca & parse file hasil Allure (JSON) jadi array test
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { saveAllureScreenshot } = require("../utils/saveScreenshot"); // simpan screenshot attachment Allure ke path
const { getScreenshotFromTest } = require("../utils/allureScreenshot"); // cari screenshot attachment di object test Allure

const path = require("path");

// path folder allure-results dari .env
const ALLURE_RESULT_DIR = process.env.ALLURE_RESULTS_PATH; 

async function syncAllureToDatabase() {
  // if env kosong, file allure tidak ditemukan dan tidak bisa dibaca
  if (!ALLURE_RESULT_DIR) throw new Error("ALLURE_RESULTS_PATH hasn't been configured in the .env file.");

  const results = readAllureResults();

  // HITUNG SUMMARY
  const totalPass = results.filter(r => r.status === "passed").length;
  const totalFail = results.filter(r => r.status === "failed").length;
  const totalBroken = results.filter(r => r.status === "broken").length;
  const status = (totalFail + totalBroken) > 0 ? "FAILED" : "PASSED";

  // UPSERT (update jika row scope all dan scopevalue all sudah ada, jika belum maka create) test_run 
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

  // looping test case
  for (const test of results) {

    // get suiteName dari labels
    const suiteLabel = test.labels?.find(l => l.name === "suite");
    const suiteName = suiteLabel?.value || "UNKNOWN";

    // menentukan specPath (identitas file/spec)
    const fileLabel = test.labels?.find(l => l.name === "file");
    const specPath = fileLabel?.value || test.fullName || "UNKNOWN_SPEC";

    // test name + status
    const testName = test.name || "UNKNOWN_TEST";
    const statusUpper = (test.status || "unknown").toUpperCase();

    // durasi test + error message
    const durationMs = test.stop && test.start ? test.stop - test.start : 0;
    const errorMessage = ["failed", "broken"].includes(test.status || "")
      ? (test.statusDetails?.message || test.statusDetails?.trace || null)
      : null;

    // ambil screenshot attachment (kalau ada, biasanya di test yang error)
    const screenshotFileName = getScreenshotFromTest(test);

    if (screenshotFileName) {
      saveAllureScreenshot(ALLURE_RESULT_DIR, screenshotFileName);
    }
    
    // Update DB
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
        screenshotUrl: screenshotFileName ? path.basename(screenshotFileName) : null,
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
