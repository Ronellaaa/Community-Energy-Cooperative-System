const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src/styles/feature-3');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.css'));

const replacements = [
  // Page background and text
  { regex: /background:\s+radial-gradient\([^;]+linear-gradient[^;]+;/g, replace: 'background:\n    radial-gradient(circle at top left, rgba(236, 199, 94, 0.18), transparent 22%),\n    radial-gradient(circle at 85% 18%, rgba(79, 163, 118, 0.18), transparent 24%),\n    linear-gradient(180deg, #05120f 0%, #081815 34%, #10231d 100%);' },
  { regex: /color:\s*#102a43;/g, replace: 'color: #ffffff;' },
  { regex: /color:\s*#0f172a;/g, replace: 'color: #ffffff;' },
  { regex: /color:\s*#334155;/g, replace: 'color: #eef2ef;' },
  { regex: /color:\s*#475569;/g, replace: 'color: rgba(255, 255, 255, 0.86);' },
  { regex: /color:\s*#64748b;/g, replace: 'color: rgba(255, 255, 255, 0.7);' },
  { regex: /color:\s*#0f766e;/g, replace: 'color: #8de2a8;' },
  { regex: /color:\s*#1e293b;/g, replace: 'color: #ffffff;' },
  
  // Panels, cards, and inputs
  { regex: /background:\s*rgba\(255, 255, 255, 0\.\d+\);/g, replace: 'background: rgba(255, 255, 255, 0.08);' },
  { regex: /background:\s*#fff;/g, replace: 'background: rgba(255, 255, 255, 0.05);' },
  { regex: /background:\s*#ffffff;/g, replace: 'background: rgba(255, 255, 255, 0.05);' },
  { regex: /border:\s*1px solid rgba\(148, 163, 184, 0\.\d+\);/g, replace: 'border: 1px solid rgba(255, 255, 255, 0.12);' },
  { regex: /border-bottom:\s*1px solid rgba\([^)]+\);/g, replace: 'border-bottom: 1px solid rgba(255, 255, 255, 0.1);' },
  { regex: /border:\s*1px solid rgba\(226, 232, 240, [\d.]+\);/g, replace: 'border: 1px solid rgba(255, 255, 255, 0.12);' },
  
  // Tables
  { regex: /background:\s*#e2e8f0;/g, replace: 'background: rgba(255, 255, 255, 0.12);' },
  { regex: /background:\s*#eef6ff;/g, replace: 'background: rgba(255, 255, 255, 0.05);' },
  { regex: /background:\s*#f1f5f9;/g, replace: 'background: rgba(255, 255, 255, 0.05);' },
  { regex: /background:\s*#f8fafc;/g, replace: 'background: rgba(255, 255, 255, 0.03);' },
  
  // Buttons
  { regex: /background:\s*linear-gradient\(135deg, #0f766e, #0891b2\);/g, replace: 'background: linear-gradient(135deg, #f7d774, #d7b24a 62%, #b7902d); color: #151515;' },
  { regex: /background:\s*linear-gradient\(135deg, #0f766e, #0ea5a4\);/g, replace: 'background: linear-gradient(135deg, #f7d774, #d7b24a 62%, #b7902d); color: #151515;' },

  // Auras
  { regex: /background:\s*rgba\(14, 165, 233, 0\.18\);/g, replace: 'background: rgba(215, 178, 74, 0.16);' },
  { regex: /background:\s*rgba\(34, 197, 94, 0\.16\);/g, replace: 'background: rgba(111, 140, 128, 0.14);' }
];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const r of replacements) {
    content = content.replace(r.regex, r.replace);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
}
