// Simple icon generator script
// This creates placeholder icon files - for production, use the generate-icons.html tool

import { writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

// Create a simple SVG for each size as placeholder
// In production, use the generate-icons.html tool in a browser
sizes.forEach(size => {
  const svg = `<svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#60a5fa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="256" cy="256" r="240" fill="url(#gradient)"/>
  <path d="M256 80 L380 130 L380 260 Q380 340 256 420 Q132 340 132 260 L132 130 Z" fill="white" opacity="0.95"/>
  <text x="256" y="230" font-family="Arial, sans-serif" font-size="72" font-weight="900" fill="url(#gradient)" text-anchor="middle">No</text>
  <text x="256" y="310" font-family="Arial, sans-serif" font-size="72" font-weight="900" fill="url(#gradient)" text-anchor="middle">Cap</text>
  <path d="M210 340 L235 365 L310 280" stroke="url(#gradient)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;

  const outputPath = join(__dirname, 'public', `icon-${size}.png.svg`);
  writeFileSync(outputPath, svg);
  console.log(`Created icon-${size}.png.svg`);
});

console.log('\nNote: These are SVG placeholders.');
console.log('For production PNG files, open public/generate-icons.html in a browser.');
