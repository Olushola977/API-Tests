const fs = require('fs');

console.log('📋 Starting test summary generation...');

const reportData = fs.readFileSync('newman-report.json');
console.log('✅ Newman report file read successfully');

const report = JSON.parse(reportData);
console.log('✅ Report parsed successfully');
console.log(`📊 Total executions found: ${report.run.executions.length}`);

let total = 0;
let failed = 0;
let failures = [];

report.run.executions.forEach((exec, index) => {
  console.log(`\n🔍 Processing execution ${index + 1}: ${exec.item.name}`);
  
  // Check if assertions exist before iterating
  if (exec.assertions && Array.isArray(exec.assertions)) {
    console.log(`   └─ Found ${exec.assertions.length} assertions`);
    exec.assertions.forEach(assertion => {
      total++;

      if (assertion.error) {
        failed++;
        const failure = {
          test: assertion.assertion,
          endpoint: exec.item.name,
          error: assertion.error.message
        };
        failures.push(failure);
        console.log(`   ⚠️  FAILED: ${assertion.assertion} - ${assertion.error.message}`);
      } else {
        console.log(`   ✓ PASSED: ${assertion.assertion}`);
      }
    });
  } else {
    console.log(`   └─ No assertions found for this execution`);
  }
  
  // Also check response status
  if (exec.response) {
    console.log(`   └─ Response code: ${exec.response.code}`);
    total++;
    if (exec.response.code >= 400) {
      failed++;
      const failure = {
        test: `HTTP Status ${exec.response.code}`,
        endpoint: exec.item.name,
        error: `Expected 2xx, got ${exec.response.code}`
      };
      failures.push(failure);
      console.log(`   ⚠️  HTTP ERROR: ${exec.response.code}`);
    }
  }
});

// Categorization (basic example)
const criticalFailures = failures.filter(f =>
  f.endpoint.toLowerCase().includes('booking')
);

console.log(`\n📈 SUMMARY STATISTICS:`);
console.log(`   Total Tests: ${total}`);
console.log(`   Passed: ${total - failed}`);
console.log(`   Failed: ${failed}`);
console.log(`   Critical Failures: ${criticalFailures.length}`);

const summary = `
🚨 QA DAILY SUMMARY

Total Tests: ${total}
Failed: ${failed}
Passed: ${total - failed}

🔥 Critical Failures:
${criticalFailures.length ? criticalFailures.map(f =>
  `- ${f.endpoint}: ${f.error}`
).join('\n') : 'None'}

⚠️ Other Failures:
${failures.length ? failures.map(f =>
  `- ${f.endpoint}: ${f.error}`
).join('\n') : 'None'}

📌 Recommendation:
${failed > 0 ? 'Investigate failures before release' : 'Safe to proceed'}

`;

fs.writeFileSync('qa-summary.txt', summary);
console.log(`\n✅ Summary written to qa-summary.txt`);
console.log('\n📋 Summary Content:');
console.log(summary);