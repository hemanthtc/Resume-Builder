import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;
const outputFile = path.join(rootDir, 'combined_source_code.txt');

// Files to check in the root directory
const rootFilesToInclude = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'index.html',
  '.gitignore'
];

const allowedExtensions = ['.ts', '.tsx', '.css', '.html', '.json', '.js', '.jsx'];

function getFilesRecursively(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Skip node_modules, .git, and dist
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
        getFilesRecursively(filePath, fileList);
      }
    } else {
      const ext = path.extname(file);
      if (allowedExtensions.includes(ext)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
}

function combine() {
  let combinedContent = '';

  // 1. Process root files
  for (const filename of rootFilesToInclude) {
    const fullPath = path.join(rootDir, filename);
    if (fs.existsSync(fullPath)) {
      const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
      const content = fs.readFileSync(fullPath, 'utf-8');
      combinedContent += `================================================================================\n`;
      combinedContent += `FILE: ${relativePath}\n`;
      combinedContent += `================================================================================\n`;
      combinedContent += content;
      combinedContent += `\n\n`;
    }
  }

  // 2. Process files in src/
  const srcDir = path.join(rootDir, 'src');
  if (fs.existsSync(srcDir)) {
    const srcFiles = getFilesRecursively(srcDir);
    // Sort to keep order consistent
    srcFiles.sort();

    for (const fullPath of srcFiles) {
      const relativePath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
      
      // Avoid adding root files again if they are somehow under src
      if (rootFilesToInclude.includes(relativePath)) {
        continue;
      }
      
      const content = fs.readFileSync(fullPath, 'utf-8');
      combinedContent += `================================================================================\n`;
      combinedContent += `FILE: ${relativePath}\n`;
      combinedContent += `================================================================================\n`;
      combinedContent += content;
      combinedContent += `\n\n`;
    }
  }

  fs.writeFileSync(outputFile, combinedContent, 'utf-8');
  console.log(`Successfully created ${outputFile}`);
}

combine();
