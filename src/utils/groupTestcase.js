/** getParentTestCase
 * Mengambil kode parent test case dari suiteName / code test.
 *
 * Digunakan untuk:
 * - grouping test case di UI
 * - mengelompokkan test berdasarkan kode utama (AT-CORE-XXXX)
 *
 * Contoh:
 * - "AT-CORE-0012 Login Success" → "AT-CORE-0012"
 */
function getParentTestCase(code = "") {
  if (!code) return "UNKNOWN";

  // Bersihkan spasi berlebih agar regex konsisten
  const clean = code.replace(/\s+/g, "");

  // Ambil pola parent test case: AT-CORE-XXXX
  const match = clean.match(/AT-CORE-\d{4}/);

  return match ? match[0] : "UNKNOWN";
}

module.exports = { getParentTestCase };
