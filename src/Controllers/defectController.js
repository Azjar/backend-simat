const { createDefect } = require("../Services/defectServices");

async function createDefectController(req, res) {
  try {
    const result = await createDefect(req.body);

    res.status(201).json({
      message: "Defect berhasil dibuat",
      data: result,
    });
  } catch (err) {
    console.error("CREATE DEFECT ERROR:", err.message);

    res.status(400).json({
      message: err.message,
    });
  }
}

module.exports = { createDefectController };
