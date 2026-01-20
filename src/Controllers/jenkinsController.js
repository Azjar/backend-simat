const { triggerRerunSpec } = require("../Services/jenkinsWithParam");
const { resolveQueue } = require("../Services/jenkinsQueueResolver");
const { getBuildProgress } = require("../Services/jenkinsProgress");
const { get } = require("../Routes/jenkinsRoutes");
const { saveLatestTestRun } = require("../Services/saveLatestTestRun");
const defectServices = require("../Services/defectServices"); 

async function rerunSpec(req, res) {
  try {
    const { scope, target, testSpecId } = req.body;
    // Validasi input wajib
    if (!target) {
      return res.status(400).json({ message: "target must be provided" });
    }
    if (!testSpecId) {
      return res.status(400).json({ message: "testSpecId must be provided" });
    }

    // Ambil role user dari auth middleware
    const role = req.user?.role; // "qa" atau "dev"
    if (!role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Ambil defect aktif berdasarkan testSpecId
    const activeDefect =
      await defectServices.getActiveDefectByTestSpecId(testSpecId);

    // Mengatur rerun berdasarkan status defect & role
    if (activeDefect) {
      const status = activeDefect.status;

      // Jika defect masih To Do / In Progress, hanya DEV yang boleh rerun
      if (["To Do", "In Progress"].includes(status) && role !== "dev") {
        return res.status(403).json({
          message: "Rerun dissallowed: DEV is still working on the defect.",
        });
      }

      // Jika defect sudah Done, hanya QA yang boleh rerun
      if (status === "Done" && role !== "qa") {
        return res.status(403).json({
          message: "Rerun is not allowed: the task is already in Done status and is currently being handled by QA",
        });
      }
    }

    // Trigger Jenkins rerun dari specPath
    const finalSpec = target;
    const { queueUrl } = await triggerRerunSpec(finalSpec);

    // Simpan informasi test run terbaru
    await saveLatestTestRun({
      scope,
      target: finalSpec,
    });

    // Response sukses
    return res.json({
      message: "Successfully triggered Jenkins rerun",
      queueUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to trigger Jenkins" });
  }
}

// Mengambil buildNumber dari queueUrl
async function resolveQueueBuild(req, res) {
  try {
    const { queueUrl } = req.query;

    // Validasi queueUrl
    if (!queueUrl) {
      return res.status(400).json({ message: "queueUrl is required" });
    }

    // Resolve queue ke build
    const result = await resolveQueue(queueUrl);

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

// Controller untuk mendapatkan progress build dari Jenkins
async function getBuildProgressController(req, res) {
  try {
    const { buildNumber } = req.params;

    // Ambil progress build dari Jenkins
    const data = await getBuildProgress(buildNumber);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to get build progress",
    });
  }
}

module.exports = { rerunSpec, resolveQueueBuild, getBuildProgressController };
