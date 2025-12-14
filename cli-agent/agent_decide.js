const fs = require("fs");
const { execSync } = require("child_process");

/* =========================
   Paths
========================= */
const SCAN_REPORT = "/output/scan_report.json";
const PACKAGE_JSON = "/app/package.json";
const OUTPUT_DIR = "/output";
const UPGRADE_REPORT = "/output/upgrade_report.json";

/* =========================
   Ensure output dir
========================= */
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

/* =========================
   Helpers
========================= */
function normalize(v) {
  return v.replace(/^[^0-9]*/, "");
}

function getMajor(v) {
  return normalize(v).split(".")[0];
}

function isCanary(v) {
  return /canary|alpha|beta|rc/i.test(v);
}

function isValidSemver(v) {
  return /^\d+\.\d+\.\d+$/.test(v);
}

/* =========================
   Load rules (Layer 2)
========================= */
const rules = fs.existsSync("/app/rules.json")
  ? JSON.parse(fs.readFileSync("/app/rules.json", "utf-8"))
  : {};

function isBlockedByRule(dep, current, latest) {
  const rule = rules.packages?.[dep];
  if (!rule) return null;

  if (rule.blockCanary && isCanary(latest)) {
    return "canary version blocked by policy";
  }

  if (rule.blockMajor && getMajor(current) !== getMajor(latest)) {
    return "major upgrade blocked by policy";
  }

  return null;
}

/* =========================
   Safe-minor resolver
========================= */
function getLatestWithinMajor(pkg, current) {
  try {
    const major = getMajor(current);
    const versions = JSON.parse(
      execSync(`npm view ${pkg} versions --json`, { encoding: "utf-8" })
    );

    if (!Array.isArray(versions)) return null;

    const safe = versions
      .filter(v => v.startsWith(`${major}.`))
      .filter(isValidSemver);

    return safe.length ? safe[safe.length - 1] : null;
  } catch {
    return null;
  }
}

/* =========================
   Load inputs
========================= */
const scan = JSON.parse(fs.readFileSync(SCAN_REPORT, "utf-8"));
const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, "utf-8"));

const upgraded = [];
const skipped = [];

/* =========================
   Decision loop (AGENT CORE)
========================= */
for (const dep of scan.dependencies) {
  const currentRaw = pkg.dependencies?.[dep.name];
  if (!currentRaw) continue;

  const current = normalize(currentRaw);
  const currentMajor = getMajor(current);
  const latestMajor = getMajor(dep.latest);

  // Policy layer
  const blocked = isBlockedByRule(dep.name, current, dep.latest);
  if (blocked) {
    skipped.push({
      name: dep.name,
      current,
      latest: dep.latest,
      reason: blocked
    });
    continue;
  }

  // Major upgrade → try safe minor
  if (currentMajor !== latestMajor) {
    const safeMinor = getLatestWithinMajor(dep.name, current);

    if (!safeMinor || safeMinor === current) {
      skipped.push({
        name: dep.name,
        current,
        latest: dep.latest,
        reason: "major upgrade blocked"
      });
      continue;
    }

    pkg.dependencies[dep.name] = safeMinor;
    upgraded.push({
      name: dep.name,
      from: current,
      to: safeMinor,
      type: "safe-minor"
    });
    continue;
  }

  // Same major → upgrade to latest
  if (current !== dep.latest && isValidSemver(dep.latest)) {
    pkg.dependencies[dep.name] = dep.latest;
    upgraded.push({
      name: dep.name,
      from: current,
      to: dep.latest,
      type: "latest"
    });
  }
}

/* =========================
   Write report FIRST
========================= */
const report = {
  upgraded_at: new Date().toISOString(),
  status: "SAFE",
  upgraded,
  skipped
};

fs.writeFileSync(UPGRADE_REPORT, JSON.stringify(report, null, 2));

/* =========================
   Exit early if nothing changed
========================= */
if (upgraded.length === 0) {
  console.log("No safe upgrades found.");
  process.exit(0);
}

/* =========================
   Write package.json
========================= */
fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2));

/* =========================
   Install & rollback handling
========================= */
console.log("Running npm install...");

try {
  execSync("npm install", { stdio: "inherit" });
  console.log("Upgrade completed successfully.");
} catch (err) {
  console.error("Dependency resolution failed.");

  const failedReport = JSON.parse(
    fs.readFileSync(UPGRADE_REPORT, "utf-8")
  );

  failedReport.status = "FAILED";
  failedReport.failure_reason = "Dependency resolution failed (ERESOLVE)";
  failedReport.suggestion =
    "Manual review required (peer dependency conflict)";

  fs.writeFileSync(
    UPGRADE_REPORT,
    JSON.stringify(failedReport, null, 2)
  );

  process.exit(1);
}