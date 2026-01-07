const axios = require("axios");

const JENKINS_BASE_URL = process.env.JENKINS_URL;
const JOB_NAME = "eksekusi-ulang";

const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_TOKEN = process.env.JENKINS_TOKEN;

function normalizeSpecPath(specPath) {
  if (!specPath) return null;
  return specPath.split("#")[0];
}

async function triggerRerunSpec(specPath) {
  const cleanSpec = normalizeSpecPath(specPath);

  const url = `${JENKINS_BASE_URL}/job/${JOB_NAME}/buildWithParameters`;

  const response = await axios.post(
    url,
    null,
    {
      params: {
        SPEC: cleanSpec
      },
      auth: {
        username: JENKINS_USER,
        password: JENKINS_TOKEN
      }
    }
  );

  /**
   * Jenkins mengirim lokasi queue di header untuk track di
   */
  const queueUrl = response.headers.location;

  return {
    queueUrl,
    spec: cleanSpec
  };
}

module.exports = { triggerRerunSpec };
