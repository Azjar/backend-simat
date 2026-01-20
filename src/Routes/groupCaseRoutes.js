const express = require("express");
const router = express.Router();
// Controller untuk mengambil test case yang sudah dikelompokkan
const { getGroupedTestCases } = require("../controllers/testcaseGroupController");
// Middleware autentikasi untuk memastikan user sudah login
const authMiddleware = require("../Middleware/auth");

/**GET /grouped-testcases
 * - Mengambil daftar test case yang sudah dikelompokkan berdasarkan parent suite / test case.
 */
router.get(
  "/grouped-testcases",
  authMiddleware,      // cek token & set req.user
  getGroupedTestCases  // controller grouping test cases
);

// Export router untuk digunakan di app utama
module.exports = router;
