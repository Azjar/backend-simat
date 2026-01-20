const { syncAllureToDatabase } = require("../Services/allureSyncServices");

async function syncAllure(res) {
  try {
    const result = await syncAllureToDatabase();
    res.json({
      message: "Allure synced to database",
      result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to sync allure" });
  }
}

module.exports = { syncAllure };
