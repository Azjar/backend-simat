const userService = require("../Services/userServices");

exports.getDevelopers = async (req, res) => {
  try {
    const developers = await userService.getUsersByRole("dev");
    res.json(developers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal mengambil data developer" });
  }
};
