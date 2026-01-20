const { createDefect,   getActiveDefectByTestSpecId } = require("../Services/defectServices");

async function createDefectController(req, res) {
  try {
    // ambil payload dari req.body (data dari user)
    const result = await createDefect(req.body);

    // kalau sukses, kirim response 201 created + data hasil create
    return res.status(201).json({
      message: "Defect successfully created",
      data: result,
    });
  } catch (err) {
    // gagal
    console.error("CREATE DEFECT ERROR:", err);

    // kirim response error ke user 
    return res.status(400).json({ // 400, error input/request (bad request)
      message: err.message,
    });
  }
}


async function getActiveDefectController(req, res) {
  try {
    // ambil testSpecId dari query string
    const { testSpecId } = req.query;
    // validasi if !testspecid return error 400
    if (!testSpecId) {
      return res.status(400).json({ message: "testSpecId must be sent" });
    }

    // services (get data)
    const data = await getActiveDefectByTestSpecId(testSpecId);

    return res.status(200).json({ data }); // data bisa null
  } catch (err) {
    console.error("GET ACTIVE DEFECT ERROR:", err.message);
    return res.status(400).json({ message: err.message });
  }
};

module.exports = { createDefectController, getActiveDefectController };
