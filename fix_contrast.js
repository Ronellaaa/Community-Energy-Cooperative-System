const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend/src/styles/feature-3');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.css'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix overridden button colors (where color: #f8fafc comes AFTER our color: #151515 insert)
  // We can just strip out any standalone color: #f8fafc; or color: #fff; if it's inside an actionBtn or primary btn class,
  // or just replace occurrences of `color: #f8fafc;\n` inside buttons.
  // Actually, simplest is to enforce color: #10211D !important; on the gradient button logic.
  content = content.replace(/background:\s*linear-gradient\(135deg, #f7d774, #d7b24a 62%, #b7902d\)[^;]*;[^\n]*\n?/g, 'background: linear-gradient(135deg, #f7d774, #d7b24a 62%, #b7902d);\n  color: #10211D !important;\n');

  // Fix other stray light backgrounds
  content = content.replace(/background:\s*rgba\(255, 255, 255, 1\);/g, 'background: rgba(255, 255, 255, 0.05);');
  content = content.replace(/background:\s*#dbeafe;/g, 'background: rgba(255, 255, 255, 0.12);');
  content = content.replace(/background:\s*#ecfdf5;/g, 'background: rgba(16, 185, 129, 0.1);');
  content = content.replace(/background:\s*#fff1f2;/g, 'background: rgba(239, 68, 68, 0.1);');
  content = content.replace(/background:\s*rgba\(45, 212, 191, 0\.22\);/g, 'background: rgba(45, 212, 191, 0.12);');
  content = content.replace(/background:\s*rgba\(37, 99, 235, 0\.16\);/g, 'background: rgba(37, 99, 235, 0.12);');
  content = content.replace(/background:\s*rgba\(219, 234, 254, 0\.9\);/g, 'background: rgba(255, 255, 255, 0.05);');
  content = content.replace(/background:\s*rgba\(248, 250, 252, 0\.9\);/g, 'background: rgba(255, 255, 255, 0.05);');
  content = content.replace(/background:\s*linear-gradient\(180deg, rgba\(255, 255, 255, 0\.96\), rgba\(241, 245, 249, 0\.92\)\);/g, 'background: rgba(255, 255, 255, 0.05);');
  content = content.replace(/background:\s*linear-gradient\(180deg, rgba\(248, 250, 252, 0\.96\), rgba\(255, 255, 255, 0\.86\)\);/g, 'background: rgba(255, 255, 255, 0.05);');
  content = content.replace(/background:\s*linear-gradient\(180deg, rgba\(248, 250, 252, 0\.94\), rgba\(255, 255, 255, 0\.9\)\);/g, 'background: rgba(255, 255, 255, 0.05);');
  content = content.replace(/background:\s*linear-gradient\(180deg, rgba\(240, 253, 250, 0\.94\), rgba\(236, 253, 245, 0\.94\)\);/g, 'background: rgba(255, 255, 255, 0.05);');
  content = content.replace(/background:\s*linear-gradient\(180deg, rgba\(248, 250, 252, 0\.94\), rgba\(239, 246, 255, 0\.94\)\);/g, 'background: rgba(255, 255, 255, 0.05);');
  content = content.replace(/background:\s*linear-gradient\(180deg, #f8fafc 0%, #eef4ff 100%\);/g, 'background: rgba(255, 255, 255, 0.05);');
  content = content.replace(/background:\s*#f8fbff;/g, 'background: rgba(255, 255, 255, 0.02);');
  content = content.replace(/background:\s*#e2e8f0;/g, 'background: rgba(255, 255, 255, 0.12);');

  // Fix pill text colors (dark red -> bright red, etc. on dark background)
  content = content.replace(/color:\s*#a16207;/g, 'color: #fde047;'); // bright yellow for pending
  content = content.replace(/color:\s*#047857;/g, 'color: #6ee7b7;'); // bright green for paid/approved
  content = content.replace(/color:\s*#b91c1c;/g, 'color: #fca5a5;'); // bright red for overdue/rejected
  content = content.replace(/color:\s*#0369a1;/g, 'color: #7dd3fc;'); // bright blue for submitted
  
  // Make sure option tags inside select have dark background so they are readable!
  if (!content.includes('select option {')) {
    content += '\n\nselect option {\n  background: #10211D;\n  color: #fff;\n}\n';
  }

  // Also replace some hardcoded hover colors that might still have white text on white bg
  content = content.replace(/background:\s*linear-gradient\(135deg, #1d4ed8, #0f766e\);/g, 'background: linear-gradient(135deg, #1d4ed8, #0f766e);\n  color: #fff !important;');
  
  fs.writeFileSync(filePath, content, 'utf8');
}
console.log("Contrast fixes applied!");
