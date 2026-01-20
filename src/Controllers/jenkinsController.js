const { triggerRerunSpec } = require("../Services/jenkinsWithParam");
const { resolveQueue } = require("../Services/jenkinsQueueResolver");
const { getBuildProgress } = require("../Services/jenkinsProgress");
const { get } = require("../Routes/jenkinsRoutes");
const { saveLatestTestRun } = require("../Services/testRunJenServices");

const defectServices = require("../Services/defectServices"); 
// misal exported: { getActiveDefectByTestSpecId }

async function rerunSpec(req, res) {
  try {
    const { scope, target, testSpecId } = req.body;
    // console.log("cookies:", req.cookies);
    // console.log("user:", req.user);

    // 1) validasi
    if (!target) return res.status(400).json({ message: "Target is required" });
    if (!testSpecId) return res.status(400).json({ message: "testSpecId is required" });

    // 2) ambil role user (asumsi sudah ada auth middleware yang set req.user)
    const role = req.user?.role; // "qa" / "dev"
    if (!role) return res.status(401).json({ message: "Unauthorized" });

    // 3) cek defect aktif
    const activeDefect = await defectServices.getActiveDefectByTestSpecId(testSpecId);

    // 4) enforce policy
    if (activeDefect) {
      const status = activeDefect.status;

      // To Do / In Progress => DEV only
      if (["To Do", "In Progress"].includes(status) && role !== "dev") {
        return res.status(403).json({
          message: "Rerun is not allowed: the task is currently being handled by developer",
        });
      }

      // Done => QA only
      if (status === "Done" && role !== "qa") {
        return res.status(403).json({
          message: "Rerun is not allowed: the task is already in Done status and is currently being handled by QA",
        });
      }
    }

    // 5) baru trigger Jenkins
    const finalSpec = target;
    const { queueUrl } = await triggerRerunSpec(finalSpec);

    await saveLatestTestRun({ scope, target: finalSpec });

    return res.json({ message: "Rerun spec has been successfully triggered", queueUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to trigger the Jenkins job" });
  }
}


async function resolveQueueBuild(req, res) {
  try {
    const { queueUrl } = req.query;

    if (!queueUrl) {
      return res.status(400).json({ message: "queueUrl is required" });
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
    res.status(500).json({ message: "Failed to retrieve Jenkins progress" });
  }
}

module.exports = { rerunSpec, resolveQueueBuild, getBuildProgressController };
