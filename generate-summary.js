const fs = require('fs');

const report = JSON.parse(fs.readFileSync('newman-report.json'));

let total = 0;
let failed = 0;
let failures = [];

report.run.executions.forEach(exec => {
  exec.assertions.forEach(assertion => {
    total++;

    if (assertion.error) {
      failed++;
      failures.push({
        test: assertion.assertion,
        endpoint: exec.item.name,
        error: assertion.error.message
      });
    }
  });
});

// Categorization (basic example)
const criticalFailures = failures.filter(f =>
  f.endpoint.toLowerCase().includes('booking')
);

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
console.log(summary);