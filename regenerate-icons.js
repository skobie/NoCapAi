import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sizes = [16, 32, 72, 96, 128, 144, 152, 180, 192, 384, 512];

async function generateIcons() {
  const svgPath = join(__dirname, 'public', 'logo.svg');
  const svgBuffer = readFileSync(svgPath);

  console.log('Generating icons from logo.svg...\n');

  for (const size of sizes) {
    const outputPath = join(__dirname, 'public', `icon-${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated icon-${size}.png`);
  }

  const faviconPath = join(__dirname, 'public', 'favicon.ico');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(faviconPath);

  console.log('✓ Generated favicon.ico');

  console.log('\n✓ All public icons generated successfully!');

  console.log('\nGenerating iOS splash screens...\n');

  const iosSplashPath = join(__dirname, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset', 'splash-2732x2732.png');
  await sharp(svgBuffer)
    .resize(2732, 2732)
    .png()
    .toFile(iosSplashPath);
  console.log('✓ Generated splash-2732x2732.png');

  const iosSplash1Path = join(__dirname, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset', 'splash-2732x2732-1.png');
  await sharp(svgBuffer)
    .resize(2732, 2732)
    .png()
    .toFile(iosSplash1Path);
  console.log('✓ Generated splash-2732x2732-1.png');

  const iosSplash2Path = join(__dirname, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset', 'splash-2732x2732-2.png');
  await sharp(svgBuffer)
    .resize(2732, 2732)
    .png()
    .toFile(iosSplash2Path);
  console.log('✓ Generated splash-2732x2732-2.png');

  console.log('\nGenerating iOS app icon...\n');

  const iosIconPath = join(__dirname, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset', 'AppIcon-512@2x.png');
  await sharp(svgBuffer)
    .resize(1024, 1024)
    .png()
    .toFile(iosIconPath);
  console.log('✓ Generated AppIcon-512@2x.png (1024x1024)');

  console.log('\n✓ All icons generated successfully!');
}

generateIcons().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
