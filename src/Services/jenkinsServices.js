const axios = require('axios')

const JENKINS_BASE_URL = 'http://localhost:8080'
const JOB_NAME = 'eksekusi-ulang'
const AUTH = {
  username: process.env.JENKINS_USER,
  password: process.env.JENKINS_TOKEN,
}

async function getLatestAllureSummary() {
  // ambil build terakhir
  const buildRes = await axios.get(
    `${JENKINS_BASE_URL}/job/${JOB_NAME}/lastBuild/api/json`,
    { auth: AUTH }
  )

  const buildNumber = buildRes.data.number

  // ambil allure summary
  const allureRes = await axios.get(
    `${JENKINS_BASE_URL}/job/${JOB_NAME}/${buildNumber}/allure/widgets/summary.json`,
    { auth: AUTH }
  )

  return {
    buildNumber,
    ...allureRes.data.statistic
  }
}

module.exports = { getLatestAllureSummary }
