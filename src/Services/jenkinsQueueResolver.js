const axios = require("axios");

const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_TOKEN = process.env.JENKINS_TOKEN;

/**
 * Fungsi untuk menunggu hingga Jenkins mendapat buildNumber
 * Jenkins saat trigger job TIDAK langsung memberikan build number, melainkan hanya queueUrl. 
 * Fungsi ini akan:
 * 1. Polling endpoint queue Jenkins
 * 2. Mengecek apakah executable (build) sudah tersedia
 * 3. Mengembalikan buildNumber dan buildUrl jika sudah ada
 */
async function resolveQueue(queueUrl, retry = 20, delay = 1000) {
  // Validasi queueUrl agar tidak memanggil endpoint yang salah
  if (!queueUrl || !queueUrl.startsWith("http")) {
    throw new Error(`❌ queueUrl tidak valid: ${queueUrl}`);
  }

  // Polling Jenkins queue hingga executable tersedia
  for (let i = 0; i < retry; i++) {
    const res = await axios.get(`${queueUrl}api/json`, {
      auth: {
        username: JENKINS_USER,
        password: JENKINS_TOKEN,
      },
    });

    // executable hanya muncul jika build sudah benar-benar dimulai
    const executable = res.data.executable;

    if (executable) {
      return {
        buildNumber: executable.number,
        buildUrl: executable.url,
      };
    }

    // Tunggu sebelum polling berikutnya
    await new Promise((r) => setTimeout(r, delay));
  }

  // Jika setelah retry build belum juga muncul
  throw new Error("Queue timeout: build belum mulai");
}

module.exports = { resolveQueue };
