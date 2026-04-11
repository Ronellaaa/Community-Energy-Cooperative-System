const fs = require('fs');
const file = 'frontend/src/styles/feature-3/community-bills.css';
let lines = fs.readFileSync(file, 'utf8').split('\n');

const missingContents = `
.f3cb-title {
  font-size: clamp(2rem, 4vw, 3.25rem);
  line-height: 1.05;
}

.f3cb-subtitle,
.f3cb-sectionText,
.f3cb-summaryHint {
  margin: 0;
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.7;
}

.f3cb-summaryPanel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(215, 178, 74, 0.8), rgba(67, 166, 120, 0.8));
  color: #eff6ff;
}

.f3cb-summaryLabel {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.82;
}

.f3cb-summaryValue {
  font-family: "Syne", sans-serif;
  font-size: clamp(2.6rem, 8vw, 4.2rem);
  line-height: 1;
}

.f3cb-summaryHint {
  color: rgba(239, 246, 255, 0.88);
}`;

// On line index 120 is "  line-height: 1;", index 119 is "}"
// The lines from index 120 to 125 are exactly the mangled text that needs to be replaced.
lines.splice(120, 6, missingContents);

fs.writeFileSync(file, lines.join('\n'));
console.log('Fixed');
