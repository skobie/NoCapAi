import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const width = 1200;
const height = 630;

const svgImage = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#f472b6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#fb923c;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#grad1)"/>

  <!-- Main Title -->
  <text x="600" y="280"
        font-family="Arial, sans-serif"
        font-size="140"
        font-weight="900"
        fill="#ffffff"
        text-anchor="middle"
        style="paint-order: stroke; stroke: rgba(0,0,0,0.3); stroke-width: 6px;">
    NoCap
  </text>

  <!-- Subtitle -->
  <text x="600" y="370"
        font-family="Arial, sans-serif"
        font-size="42"
        font-weight="700"
        fill="#ffffff"
        text-anchor="middle"
        opacity="0.95">
    AI Content Detector
  </text>

  <!-- Features -->
  <text x="600" y="450"
        font-family="Arial, sans-serif"
        font-size="28"
        font-weight="500"
        fill="#ffffff"
        text-anchor="middle"
        opacity="0.9">
    Detect AI in Images • Videos • Audio
  </text>

  <!-- Bottom tag -->
  <rect x="475" y="510" width="250" height="50" rx="25" fill="rgba(255,255,255,0.2)"/>
  <text x="600" y="544"
        font-family="Arial, sans-serif"
        font-size="24"
        font-weight="700"
        fill="#ffffff"
        text-anchor="middle">
    Get 3 Free Scans
  </text>
</svg>
`;

sharp(Buffer.from(svgImage))
  .png()
  .toFile('public/og-image.png')
  .then(() => {
    console.log('✅ Professional OG image generated successfully!');
  })
  .catch(err => {
    console.error('Error generating OG image:', err);
  });
