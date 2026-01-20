const fs = require("fs");
const path = require("path");

/**readAllureResults
 * Membaca dan mem-parse seluruh file hasil test Allure
 * dari folder allure-results menjadi array object JSON.
 *
 * Util ini digunakan sebagai sumber data mentah (raw)
 * untuk proses:
 * - sinkronisasi Allure ke database
 * - perhitungan summary test
 *
 * Catatan:
 * - Hanya file dengan akhiran `-result.json` yang dibaca
 * - File lain (attachments, environment, dll) diabaikan
 */
function readAllureResults() {
  const allurePath = process.env.ALLURE_RESULTS_PATH;

  // Pastikan path allure-results tersedia
  if (!fs.existsSync(allurePath)) {
    throw new Error("Allure results path tidak ditemukan");
  }

  // Baca seluruh file dalam folder allure-results
  const files = fs.readdirSync(allurePath);

  // Ambil hanya file hasil test Allure (*-result.json)
  const resultFiles = files.filter((file) =>
    file.endsWith("-result.json")
  );

  // Parse setiap file JSON menjadi object
  return resultFiles.map((file) => {
    const fullPath = path.join(allurePath, file);
    const raw = fs.readFileSync(fullPath, "utf-8");
    return JSON.parse(raw);
  });
}

module.exports = { readAllureResults };
