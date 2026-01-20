const { syncAllureToDatabase } = require("../Services/allureSyncServices");

async function syncAllure(res) {
  try {
    // Menjalankan proses sinkronisasi Allure ke database
    const result = await syncAllureToDatabase();

    // Response ketika sinkronisasi berhasil
    res.json({
      message: "Allure synced to database",
      result,
    });
  } catch (err) {
    // Logging error untuk kebutuhan debugging server
    console.error(err);

    // Response error ketika proses sinkronisasi gagal
    res.status(500).json({
      message: "Failed to sync allure",
    });
  }
}

// Export controller agar dapat digunakan oleh route
module.exports = { syncAllure };
