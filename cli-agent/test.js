const _ = require("lodash");

// Simple test: lodash chunk should work
const result = _.chunk([1, 2, 3, 4], 2);

if (JSON.stringify(result) !== JSON.stringify([[1,2],[3,4]])) {
  console.error("❌ Test failed");
  process.exit(1);
}

console.log("✅ Test passed");