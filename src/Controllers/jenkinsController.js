const { triggerRerunSpec } = require("../services/jenkinsWithParam");
const { resolveQueue } = require("../services/jenkinsQueueResolver");
const { getBuildProgress } = require("../services/jenkinsProgress");
const { get } = require("../Routes/jenkinsRoutes");
const { saveLatestTestRun } = require("../services/testRunJenServices");

async function rerunSpec(req, res) {
  try {
    
    const { scope, target } = req.body;

    const finalSpec = target;

    const { queueUrl } = await triggerRerunSpec(finalSpec);

    // ⬇️ SIMPAN TEST RUN KHUSUS RERUN
    await saveLatestTestRun({
      scope,              // "SPEC"
      target: finalSpec,  // specPath
    });

    return res.json({
      message: "Rerun spec berhasil ditrigger",
      queueUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal trigger Jenkins" });
  }
}



async function resolveQueueBuild(req, res) {
  try {
    const { queueUrl } = req.query;

    if (!queueUrl) {
      return res.status(400).json({ message: "queueUrl wajib" });
    }

    const result = await resolveQueue(queueUrl);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function getBuildProgressController(req, res) {
  try {
    const { buildNumber } = req.params;
    const data = await getBuildProgress(buildNumber);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal ambil progress Jenkins" });
  }
}

module.exports = { rerunSpec, resolveQueueBuild, getBuildProgressController };
