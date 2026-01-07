const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { getLatestAllureSummary } = require('./jenkinsServices')

async function saveLatestTestRun({ scope, target }) {
  console.log("saveLatestTestRun CALLED WITH:", scope, target);
  if (!scope || !target) {
    throw new Error(
      "❌ saveLatestTestRun dipanggil TANPA scope & target"
    );
  }
  const summary = await getLatestAllureSummary();
  const totalFail = summary.failed + summary.broken;   
  const status = totalFail > 0 ? 'FAILED' : 'PASSED';

  return prisma.test_run.upsert({
    where: {
      scope_scopeValue: {
        scope,
        scopeValue: target,
      },
    },
    update: {
      totalPass: summary.passed,
      totalFail,
      status,
      executedAt: new Date(),
      allureUrl: `/job/eksekusi-ulang/${summary.buildNumber}/allure`,
    },
    create: {
      scope,
      scopeValue: target,
      totalPass: summary.passed,
      totalFail,
      status,
      executedAt: new Date(),
      allureUrl: `/job/eksekusi-ulang/${summary.buildNumber}/allure`,
    },
  });
}



module.exports = { saveLatestTestRun }
