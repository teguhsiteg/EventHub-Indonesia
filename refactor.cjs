const fs = require('fs');
const path = require('path');

function getFiles(dir, files = []) {
  const fileList = fs.readdirSync(dir);
  for (const file of fileList) {
    const name = path.join(dir, file);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files);
    } else if (name.endsWith('.tsx') || name.endsWith('.ts')) {
      files.push(name);
    }
  }
  return files;
}

const files = getFiles('src');

const replacements = [
  { pattern: /(?<!dark:)bg-slate-950/g, replacement: 'bg-slate-50 dark:bg-slate-950' },
  { pattern: /(?<!dark:)bg-slate-900/g, replacement: 'bg-white dark:bg-slate-900' },
  { pattern: /(?<!dark:)bg-slate-800/g, replacement: 'bg-slate-100 dark:bg-slate-800' },
  { pattern: /(?<!dark:)text-slate-100/g, replacement: 'text-slate-900 dark:text-slate-100' },
  { pattern: /(?<!dark:)text-slate-200/g, replacement: 'text-slate-800 dark:text-slate-200' },
  { pattern: /(?<!dark:)text-slate-300/g, replacement: 'text-slate-600 dark:text-slate-300' },
  { pattern: /(?<!dark:)text-slate-400/g, replacement: 'text-slate-500 dark:text-slate-400' },
  { pattern: /(?<!dark:)border-slate-800/g, replacement: 'border-slate-200 dark:border-slate-800' },
  { pattern: /(?<!dark:)border-slate-700/g, replacement: 'border-slate-300 dark:border-slate-700' },
  { pattern: /(?<!dark:)text-white/g, replacement: 'text-slate-900 dark:text-white' }
];

let totalChanges = 0;

files.forEach(file => {
  const filePath = path.resolve(file);
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  replacements.forEach(({ pattern, replacement }) => {
    content = content.replace(pattern, replacement);
  });

  // Undo text-slate-900 dark:text-white on orange buttons
  content = content.replace(/bg-orange-600([^"']*)text-slate-900 dark:text-white/g, 'bg-orange-600$1text-white');
  content = content.replace(/bg-gradient-to-r([^"']*)text-slate-900 dark:text-white/g, 'bg-gradient-to-r$1text-white');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
    totalChanges++;
  }
});

console.log(`\nCompleted! Modified ${totalChanges} files.`);
