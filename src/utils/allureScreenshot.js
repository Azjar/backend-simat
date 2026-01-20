const fs = require("fs");
const path = require("path");

/**
 * Ambil screenshot (attachment image) dari object test Allure
 */
function getScreenshotFromTest(test) {
  if (test.attachments?.length) {
    const img = test.attachments.find(a => a.type?.includes("image"));
    if (img) return img.source;
  }

  if (test.steps?.length) {
    for (const step of test.steps) {
      if (step.attachments?.length) {
        const img = step.attachments.find(a => a.type?.includes("image"));
        if (img) return img.source;
      }
    }
  }

  return null;
}

/**
 * Simpan screenshot dari allure-results ke folder lokal
 */
function saveAllureScreenshot(allureResultDir, screenshotFileName) {
  if (!screenshotFileName) return null;

  const sourcePath = path.join(allureResultDir, screenshotFileName);
  const targetDir = path.join(process.cwd(), "screenshots");
  const targetPath = path.join(targetDir, screenshotFileName);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log("✅ Screenshot copied:", screenshotFileName);
    return targetPath;
  } else {
    console.warn("⚠️ Screenshot not found:", sourcePath);
    return null;
  }
}

module.exports = {
  getScreenshotFromTest,
  saveAllureScreenshot,
};
