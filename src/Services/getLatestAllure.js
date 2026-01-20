const axios = require('axios')

const JENKINS_BASE_URL = process.env.JENKINS_URL
const JOB_NAME = 'eksekusi-ulang'
const AUTH = {
  username: process.env.JENKINS_USER,
  password: process.env.JENKINS_TOKEN,
}

/** getLatestAllureSummary
 * Mengambil ringkasan (summary) hasil test Alluredari build Jenkins TERAKHIR
 * Alur kerja:
 * 1. Mengambil informasi lastBuild Jenkins
 * 2. Mendapatkan buildNumber terakhir
 * 3. Mengambil file Allure summary.json dari build tersebut
 */
async function getLatestAllureSummary() {
  // Ambil data build terakhir dari Jenkins
  const buildRes = await axios.get(
    `${JENKINS_BASE_URL}/job/${JOB_NAME}/lastBuild/api/json`,
    { auth: AUTH }
  )

  const buildNumber = buildRes.data.number

  // Ambil summary Allure dari build terakhir
  const allureRes = await axios.get(
    `${JENKINS_BASE_URL}/job/${JOB_NAME}/${buildNumber}/allure/widgets/summary.json`,
    { auth: AUTH }
  )

  return {
    buildNumber,
    ...allureRes.data.statistic,
  }
}

module.exports = { getLatestAllureSummary }
