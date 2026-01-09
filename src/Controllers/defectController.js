const { createDefect,   getActiveDefectByTestSpecId } = require("../Services/defectServices");

async function createDefectController(req, res) {
  try {
    const result = await createDefect(req.body);

    return res.status(201).json({
      message: "Defect berhasil dibuat",
      data: result,
    });
  } catch (err) {
    console.error("CREATE DEFECT ERROR:", err);

    return res.status(400).json({
      message: err.message,
    });
  }
}


async function getActiveDefectController(req, res) {
  try {
    const { testSpecId } = req.query;
    if (!testSpecId) {
      return res.status(400).json({ message: "testSpecId wajib dikirim" });
    }

    const data = await getActiveDefectByTestSpecId(testSpecId);

    return res.status(200).json({ data }); // data bisa null
  } catch (err) {
    console.error("GET ACTIVE DEFECT ERROR:", err.message);
    return res.status(500).json({ message: err.message });
  }
}

module.exports = { createDefectController, getActiveDefectController };
