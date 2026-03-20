import fs from 'fs';

const files = [
  'src/App.jsx',
  'src/components/RepoInput.jsx',
  'src/components/SummaryView.jsx',
  'src/components/ChatInterface.jsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\\`/g, '`');
  content = content.replace(/\\\${/g, '${');
  fs.writeFileSync(file, content);
}
console.log('Fixed syntax strings successfully!');
