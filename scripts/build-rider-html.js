#!/usr/bin/env node
// Post-build: generate build/rider/index.html from build/index.html
// Swaps in the rider manifest + icon so the PWA installs as "KT Rider App".
// Injects localStorage flag so React boots in rider-only mode without a redirect.

const fs   = require('fs');
const path = require('path');

const buildDir  = path.join(__dirname, '..', 'build');
const mainHtml  = fs.readFileSync(path.join(buildDir, 'index.html'), 'utf8');

let html = mainHtml
  .replace(/<title>[^<]*<\/title>/, '<title>KT Rider App</title>')
  .replace(/rel="manifest" href="[^"]*"/, 'rel="manifest" href="/MazdooriApp/rider/manifest.json"')
  .replace(/rel="apple-touch-icon" href="[^"]*"/, 'rel="apple-touch-icon" href="/MazdooriApp/rider/icon-192.png"')
  .replace('</head>', '<script>localStorage.setItem("riderMode","1");</script></head>');

const riderDir = path.join(buildDir, 'rider');
fs.mkdirSync(riderDir, { recursive: true });
fs.writeFileSync(path.join(riderDir, 'index.html'), html);
console.log('✓ build/rider/index.html generated');
