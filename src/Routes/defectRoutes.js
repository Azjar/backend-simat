const express = require("express");
const router = express.Router();
const { createDefectController, getActiveDefectController } = require("../Controllers/defectController");
const authMiddleware = require("../Middleware/auth");
const requireQA = require("../Middleware/requireQA");

// create defect
router.post(
    "/defects", 
    authMiddleware, // cek token & set req.user
    requireQA, // cek role user dari req.user (harus QA)
    createDefectController // controller create defect
);

// get semua defect yang aktif
router.get(
    "/defects/active", 
    authMiddleware, 
    getActiveDefectController
);

module.exports = router;
