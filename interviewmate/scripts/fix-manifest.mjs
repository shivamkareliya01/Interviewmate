import fs from 'fs';
import path from 'path';

const nitroAssetsDir = path.join(process.cwd(), 'node_modules', '.nitro', 'vite', 'services', 'ssr', 'assets');
const vercelManifestPath = path.join(process.cwd(), '.vercel', 'output', 'functions', '__server.func', '_tanstack-start-manifest_v.mjs');

if (!fs.existsSync(vercelManifestPath)) {
  console.warn('Vercel manifest not found at expected path. Skipping fix.');
  process.exit(0);
}

if (!fs.existsSync(nitroAssetsDir)) {
  console.warn('Nitro assets directory not found. Skipping fix.');
  process.exit(0);
}

const files = fs.readdirSync(nitroAssetsDir);
const manifestFile = files.find(f => f.startsWith('_tanstack-start-manifest_v') && f.endsWith('.js'));

if (!manifestFile) {
  console.error('❌ Could not find the correct manifest file in the nitro assets directory!');
  process.exit(1);
}

const goodManifestPath = path.join(nitroAssetsDir, manifestFile);
const goodContent = fs.readFileSync(goodManifestPath, 'utf-8');

// Replace the bad manifest with the good manifest.
fs.writeFileSync(vercelManifestPath, goodContent);
console.log(`✅ Successfully replaced broken manifest with the correct production manifest from ${manifestFile}`);
