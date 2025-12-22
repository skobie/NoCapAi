import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const width = 1200;
const height = 630;

const svgImage = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1e293b;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#334155;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ec4899;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#f97316;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#grad1)"/>

  <!-- Decorative Elements -->
  <circle cx="150" cy="100" r="80" fill="rgba(236, 72, 153, 0.1)"/>
  <circle cx="1050" cy="530" r="100" fill="rgba(249, 115, 22, 0.1)"/>

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
        fill="#ec4899"
        text-anchor="middle">
    Images  •  Videos  •  Audio
  </text>

  <!-- CTA -->
  <text x="600" y="550"
        font-family="-apple-system, BlinkMacSystemFont, Arial, sans-serif"
        font-size="22"
        font-weight="500"
        fill="#64748b"
        text-anchor="middle">
    Start with 3 free scans
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
