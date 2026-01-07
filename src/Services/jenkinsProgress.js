const axios = require("axios");

const JENKINS_BASE_URL = process.env.JENKINS_URL;
const JOB_NAME = "eksekusi-ulang";

const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_TOKEN = process.env.JENKINS_TOKEN;

async function getBuildProgress(buildNumber) {
  const url = `${JENKINS_BASE_URL}/job/${JOB_NAME}/${buildNumber}/api/json`;

  const { data } = await axios.get(url, {
    auth: {
      username: JENKINS_USER,
      password: JENKINS_TOKEN,
    },
  });

  const building = data.building;
  const result = data.result;

  // heuristic progress
  let progress = building ? 50 : 100;

  return {
    progress,
    building,
    finished: !building,
    status: result || "RUNNING",
  };
}

module.exports = { getBuildProgress };
