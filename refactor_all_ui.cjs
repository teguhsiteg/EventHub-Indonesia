const fs = require('fs');
const path = require('path');

const DIRECTORIES = [
  path.join(__dirname, 'src', 'pages'),
  path.join(__dirname, 'src', 'components')
];

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  // Replace text colors
  content = content.replace(/\btext-blue-(?:500|600)\b/g, 'text-[var(--accent)]');
  content = content.replace(/\btext-amber-(?:500|600)\b/g, 'text-[var(--accent)]');
  content = content.replace(/\btext-slate-900\b/g, 'text-[var(--text-primary)]');
  content = content.replace(/\btext-slate-800\b/g, 'text-[var(--text-primary)]');
  content = content.replace(/\btext-slate-500\b/g, 'text-[var(--text-secondary)]');
  content = content.replace(/\btext-slate-400\b/g, 'text-[var(--text-secondary)]');
  
  // Replace backgrounds
  content = content.replace(/\bbg-blue-(?:500|600)\b/g, 'bg-[var(--accent)]');
  content = content.replace(/\bhover:bg-blue-700\b/g, 'hover:bg-[var(--accent-hover)]');
  content = content.replace(/\bbg-slate-900\b/g, 'bg-[var(--bg-primary)]');
  content = content.replace(/\bhover:bg-slate-800\b/g, 'hover:bg-[var(--bg-secondary)]');
  content = content.replace(/\bbg-slate-100\b/g, 'bg-[var(--bg-secondary)]');
  content = content.replace(/\bhover:bg-slate-50\b/g, 'hover:bg-[var(--bg-primary)]');
  content = content.replace(/\bbg-slate-800\b/g, 'bg-[var(--bg-secondary)]');
  
  // Clean up dark mode specific variants since our CSS variables handle dark mode natively now
  content = content.replace(/\bdark:bg-slate-900\b/g, '');
  content = content.replace(/\bdark:bg-slate-800\b/g, '');
  content = content.replace(/\bdark:text-white\b/g, '');
  content = content.replace(/\bdark:text-slate-300\b/g, '');
  content = content.replace(/\bdark:text-slate-400\b/g, '');
  content = content.replace(/\bdark:border-slate-700\b/g, '');
  content = content.replace(/\bdark:border-slate-800\b/g, '');
  content = content.replace(/\bdark:bg-white\b/g, '');
  content = content.replace(/\bdark:hover:bg-slate-100\b/g, '');
  content = content.replace(/\bdark:text-slate-900\b/g, '');
  
  // Borders
  content = content.replace(/\bborder-slate-200\b/g, 'border-[var(--glass-border)]');
  content = content.replace(/\bborder-slate-300\b/g, 'border-[var(--glass-border)]');
  content = content.replace(/\bborder-slate-800\b/g, 'border-[var(--glass-border)]');

  // Gradients
  content = content.replace(/\bfrom-blue-600\b/g, 'from-[var(--accent)]');
  content = content.replace(/\bto-blue-700\b/g, 'to-[var(--accent-hover)]');

  // Cleanup multiple spaces caused by stripping dark: classes
  content = content.replace(/  +/g, ' ');
  content = content.replace(/ className=" "/g, ' className=""');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

DIRECTORIES.forEach(walkDir);
console.log('Global UI consistency refactor complete.');
