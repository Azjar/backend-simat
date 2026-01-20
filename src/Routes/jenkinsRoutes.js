const express = require("express");
// Import controller untuk Rerun trigger Jenkins
const { rerunSpec } = require("../controllers/jenkinsController");
// Import controller untuk Resolve Queue Build Number Jenkins
const { resolveQueueBuild } = require("../controllers/jenkinsController");
// Import controller untuk mendapatkan progress build dari Jenkins
const { getBuildProgressController } = require("../controllers/jenkinsController");
// Import middleware autentikasi
const authMiddleware = require("../Middleware/auth"); 

const router = express.Router();

// Route untuk Rerun Spec di Jenkins
router.post(
    "/jenkins/rerun/spec", 
    authMiddleware,  // cek token & set req.user
    rerunSpec   // controller rerun spec
);
// Route untuk Resolve Queue Build Number di Jenkins
router.get(
    "/jenkins/queue/resolve", 
    authMiddleware, // cek token & set req.user
    resolveQueueBuild
);
// Route untuk mendapatkan progress build dari Jenkins
router.get(
    "/jenkins/build/:buildNumber/progress", 
    authMiddleware, // cek token & set req.user
    getBuildProgressController
);

module.exports = router;
