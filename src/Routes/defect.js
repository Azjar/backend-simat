const express = require("express");
const router = express.Router();
const { createDefectController } = require("../Controllers/defectController");

router.post("/defects", createDefectController);

module.exports = router;
