import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const width = 1200;
const height = 630;

const svgImage = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="galaxyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0e27;stop-opacity:1" />
      <stop offset="25%" style="stop-color:#1a1446;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2d1b69;stop-opacity:1" />
      <stop offset="75%" style="stop-color:#1a1446;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a0e27;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#60a5fa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Galaxy Background -->
  <rect width="${width}" height="${height}" fill="url(#galaxyGrad)"/>

  <!-- Stars Layer 1 -->
  <circle cx="120" cy="80" r="2" fill="white" opacity="0.8"/>
  <circle cx="250" cy="150" r="1.5" fill="white" opacity="0.6"/>
  <circle cx="450" cy="100" r="2" fill="white" opacity="0.9"/>
  <circle cx="680" cy="60" r="1" fill="white" opacity="0.7"/>
  <circle cx="890" cy="120" r="2" fill="white" opacity="0.8"/>
  <circle cx="1050" cy="90" r="1.5" fill="white" opacity="0.6"/>
  <circle cx="180" cy="200" r="1" fill="white" opacity="0.5"/>
  <circle cx="950" cy="180" r="1.5" fill="white" opacity="0.7"/>

  <!-- Stars Layer 2 -->
  <circle cx="300" cy="300" r="2" fill="white" opacity="0.9"/>
  <circle cx="500" cy="250" r="1" fill="white" opacity="0.6"/>
  <circle cx="750" cy="280" r="1.5" fill="white" opacity="0.8"/>
  <circle cx="950" cy="320" r="2" fill="white" opacity="0.7"/>
  <circle cx="100" cy="350" r="1" fill="white" opacity="0.5"/>
  <circle cx="1100" cy="300" r="1.5" fill="white" opacity="0.6"/>

  <!-- Stars Layer 3 -->
  <circle cx="200" cy="450" r="1.5" fill="white" opacity="0.7"/>
  <circle cx="400" cy="480" r="2" fill="white" opacity="0.8"/>
  <circle cx="600" cy="500" r="1" fill="white" opacity="0.6"/>
  <circle cx="850" cy="470" r="1.5" fill="white" opacity="0.7"/>
  <circle cx="1000" cy="520" r="2" fill="white" opacity="0.9"/>
  <circle cx="150" cy="550" r="1" fill="white" opacity="0.5"/>
  <circle cx="750" cy="580" r="1.5" fill="white" opacity="0.6"/>
  <circle cx="550" cy="600" r="1" fill="white" opacity="0.7"/>

  <!-- Main Title - NoCap with gradient -->
  <text x="600" y="280"
        font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif"
        font-size="140"
        font-weight="900"
        fill="url(#textGrad)"
        text-anchor="middle"
        filter="url(#glow)">
    NoCap
  </text>

  <!-- Subtitle -->
  <text x="600" y="370"
        font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif"
        font-size="42"
        font-weight="700"
        fill="#22d3ee"
        text-anchor="middle">
    Detect fake content instantly
  </text>

  <!-- Features -->
  <text x="600" y="470"
        font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif"
        font-size="28"
        font-weight="600"
        fill="#60a5fa"
        text-anchor="middle">
    AI-Powered Content Verification
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
