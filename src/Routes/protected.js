// Inisialisasi router Express
const express = require("express");
const router = express.Router();
// Middleware autentikasi
const authMiddleware = require("../Middleware/auth");
// Middleware otorisasi berbasis role
const role = require("../Middleware/role");
// Controller user
const userController = require("../Controllers/userController");

/** GET /dashboard
 * - Endpoint dashboard khusus untuk role QA
 */
router.get(
  "/dashboard",
  authMiddleware,   // cek token & set req.user
  role("qa"),       // hanya QA
  (req, res) => {
    res.json({ message: "Dashboard khusus QA" });
  }
);

/** GET /suites
 * - Endpoint untuk page dan data suites
 */
router.get(
  "/suites",
  authMiddleware, //  cek token & set req.user
  role("qa", "developer"),// otorisasi role
  (req, res) => {
    res.json({ message: "Data suites" });
  }
);

/** GET /developers
 * - Mengambil daftar user dengan role developer
 */
router.get(
  "/developers",
  authMiddleware, // cek token & set req.user
  userController.getDevelopers
);

// Export router untuk dipakai di app utama
module.exports = router;
