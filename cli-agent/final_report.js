const fs = require("fs");

const scanReport = JSON.parse(
  fs.readFileSync("/output/scan_report.json", "utf-8")
);

let upgradeReport = { dependencies: [] };
if (fs.existsSync("/output/upgrade_report.json")) {
  upgradeReport = JSON.parse(
    fs.readFileSync("/output/upgrade_report.json", "utf-8")
  );
}

const testsPassed = true; // if we reached here, npm test passed

const finalReport = {
  project: scanReport.project,
  run_at: new Date().toISOString(),
  summary: {
    dependencies_scanned: scanReport.dependencies.length,
    dependencies_upgraded: upgradeReport.upgraded.length,
    status: testsPassed ? "SAFE" : "UNSAFE"
  },
  details: {
    upgraded_dependencies: upgradeReport.upgraded,
    tests_passed: testsPassed
  }
};

fs.writeFileSync(
  "/output/safeupgrade_report.json",
  JSON.stringify(finalReport, null, 2)
);

console.log("Final SafeUpgrade report generated.");