import fs from 'fs';
const file = '.output/server/_runtime.mjs';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace('createRequire(import.meta.url)', 'createRequire("file:///dummy.js")');
  fs.writeFileSync(file, content, 'utf8');
  console.log('✅ Fixed _runtime.mjs to avoid Cloudflare Workers import.meta.url bug');
}
