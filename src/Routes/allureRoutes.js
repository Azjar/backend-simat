const express = require("express");
// Import controller untuk sinkronisasi data Allure ke database
const { syncAllure } = require("../controllers/allureController");

const router = express.Router();

/** POST /allure/sync (INTERNAL ENDPOINT TO JENKINS)
 * - Men-trigger proses sinkronisasi hasil test dari Allure ke database
 * Alur:
 * Client / CI (Jenkins)
 *   → Route /allure/sync
 *   → Controller syncAllure
 *   → Service syncAllureToDatabase
 *   → Database
 */
router.post("/allure/sync", syncAllure);

// Export router agar bisa digunakan di app utama
module.exports = router;
