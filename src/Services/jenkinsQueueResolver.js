const axios = require("axios");

const JENKINS_USER = process.env.JENKINS_USER;
const JENKINS_TOKEN = process.env.JENKINS_TOKEN;

async function resolveQueue(queueUrl, retry = 20, delay = 1000) {
  for (let i = 0; i < retry; i++) {
    const res = await axios.get(`${queueUrl}api/json`, {
      auth: {
        username: JENKINS_USER,
        password: JENKINS_TOKEN,
      },
    });

    const executable = res.data.executable;

    if (executable) {
      return {
        buildNumber: executable.number,
        buildUrl: executable.url,
      };
    }

    // tunggu 1 detik
    await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error("Queue timeout: build belum mulai");
}

module.exports = { resolveQueue };
