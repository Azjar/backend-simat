const axios = require("axios");

const JENKINS_BASE_URL = process.env.JENKINS_URL; // Base URL Jenkins
const JOB_NAME = "eksekusi-ulang";  // Nama Job Jenkins
// Credential Jenkins (Basic Auth / API Token)
const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_TOKEN = process.env.JENKINS_TOKEN;

// progress re-run automation
async function getBuildProgress(buildNumber) {
  // Membuat URL API Jenkins untuk mendapatkan informasi build
  const url = `${JENKINS_BASE_URL}/job/${JOB_NAME}/${buildNumber}/api/json`;

  // Melakukan request ke Jenkins API dengan autentikasi
  const { data } = await axios.get(url, {
    auth: {
      username: JENKINS_USER,
      password: JENKINS_TOKEN,
    },
  });

  // Mendapatkan status build dari response Jenkins
  const building = data.building;
  const result = data.result;

   /**
   * Heuristic progress:
   * - 50% jika masih running
   * - 100% jika selesai
   * (tidak real-time step by step, hanya indikator kasar)
   */
  let progress = building ? 50 : 100;

  return {
    progress,           // angka progress (50 / 100)
    building,           // boolean: masih running atau tidak
    finished: !building,// true jika build sudah selesai
    status: result || "RUNNING", // status akhir atau RUNNING
  };
}

module.exports = { getBuildProgress };
