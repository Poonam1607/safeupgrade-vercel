const { execSync } = require("child_process");
const fs = require("fs");

let output = {};

try {
  const raw = execSync("npm outdated --json", { encoding: "utf-8" });
  output = JSON.parse(raw);
} catch (err) {
  // npm outdated exits with code 1 when outdated deps exist
  if (err.stdout) {
    output = JSON.parse(err.stdout.toString());
  }
}

const report = {
  project: "safeupgrade-sample",
  scanned_at: new Date().toISOString(),
  dependencies: Object.entries(output).map(([name, info]) => ({
    name,
    current: info.current,
    latest: info.latest,
    outdated: info.current !== info.latest
  }))
};

fs.writeFileSync("/output/scan_report.json", JSON.stringify(report, null, 2));

console.log("Scan completed. Report written to scan_report.json");