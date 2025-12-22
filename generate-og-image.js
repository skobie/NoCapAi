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
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#22d3ee;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#60a5fa;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a855f7;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Galaxy Background -->
  <rect width="${width}" height="${height}" fill="url(#galaxyGrad)"/>

  <!-- Stars Layer 1 - Larger stars -->
  <circle cx="120" cy="80" r="2" fill="white" opacity="0.9"/>
  <circle cx="240" cy="150" r="2" fill="white" opacity="0.8"/>
  <circle cx="450" cy="90" r="1.5" fill="white" opacity="0.7"/>
  <circle cx="680" cy="120" r="2" fill="white" opacity="0.9"/>
  <circle cx="890" cy="70" r="1.5" fill="white" opacity="0.8"/>
  <circle cx="1050" cy="140" r="2" fill="white" opacity="0.85"/>

  <!-- Stars Layer 2 - Mid-section stars -->
  <circle cx="80" cy="250" r="1.5" fill="white" opacity="0.7"/>
  <circle cx="200" cy="320" r="1" fill="white" opacity="0.6"/>
  <circle cx="380" cy="280" r="2" fill="white" opacity="0.9"/>
  <circle cx="550" cy="350" r="1" fill="white" opacity="0.5"/>
  <circle cx="750" cy="300" r="1.5" fill="white" opacity="0.8"/>
  <circle cx="920" cy="340" r="1" fill="white" opacity="0.7"/>
  <circle cx="1120" cy="280" r="2" fill="white" opacity="0.85"/>

  <!-- Stars Layer 3 - Bottom stars -->
  <circle cx="150" cy="450" r="1" fill="white" opacity="0.6"/>
  <circle cx="300" cy="520" r="1.5" fill="white" opacity="0.8"/>
  <circle cx="480" cy="480" r="1" fill="white" opacity="0.7"/>
  <circle cx="640" cy="550" r="2" fill="white" opacity="0.9"/>
  <circle cx="820" cy="500" r="1.5" fill="white" opacity="0.75"/>
  <circle cx="980" cy="560" r="1" fill="white" opacity="0.6"/>
  <circle cx="1100" cy="490" r="1.5" fill="white" opacity="0.8"/>

  <!-- Additional scattered stars -->
  <circle cx="340" cy="180" r="1" fill="white" opacity="0.5"/>
  <circle cx="520" cy="220" r="1" fill="white" opacity="0.6"/>
  <circle cx="860" cy="240" r="1" fill="white" opacity="0.7"/>
  <circle cx="180" cy="400" r="1" fill="white" opacity="0.5"/>
  <circle cx="420" cy="430" r="1" fill="white" opacity="0.6"/>
  <circle cx="720" cy="200" r="1" fill="white" opacity="0.65"/>
  <circle cx="960" cy="420" r="1" fill="white" opacity="0.55"/>

  <!-- Icon/Badge -->
  <rect x="480" y="140" width="240" height="80" rx="40" fill="url(#grad2)"/>
  <text x="600" y="195"
        font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif"
        font-size="44"
        font-weight="700"
        fill="#ffffff"
        text-anchor="middle">
    NoCap
  </text>

  <!-- Main Title -->
  <text x="600" y="310"
        font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif"
        font-size="72"
        font-weight="800"
        fill="#ffffff"
        text-anchor="middle">
    AI Content Detector
  </text>

  <!-- Subtitle -->
  <text x="600" y="380"
        font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif"
        font-size="36"
        font-weight="500"
        fill="#94a3b8"
        text-anchor="middle">
    Instantly verify authenticity of media files
  </text>

  <!-- Features -->
  <text x="600" y="480"
        font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif"
        font-size="28"
        font-weight="600"
        fill="url(#grad2)"
        text-anchor="middle">
    Images  •  Videos  •  Audio
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
