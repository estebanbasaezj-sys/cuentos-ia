const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');

async function convert() {
  const files = fs.readdirSync(iconsDir).filter(f => f.endsWith('.svg'));

  for (const file of files) {
    const svgPath = path.join(iconsDir, file);
    const pngPath = path.join(iconsDir, file.replace('.svg', '.png'));
    const svgBuffer = fs.readFileSync(svgPath);

    // Extract size from filename
    const match = file.match(/(\d+)/);
    const size = match ? parseInt(match[1]) : 192;

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(pngPath);

    console.log(`Created: ${file.replace('.svg', '.png')} (${size}x${size})`);
  }

  // Create apple-touch-icon (180x180)
  const svg192 = fs.readFileSync(path.join(iconsDir, 'icon-192.svg'));
  await sharp(svg192)
    .resize(180, 180)
    .png()
    .toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('Created: apple-touch-icon.png (180x180)');

  // Copy apple-touch-icon to public root too
  fs.copyFileSync(
    path.join(iconsDir, 'apple-touch-icon.png'),
    path.join(__dirname, '..', 'public', 'apple-touch-icon.png')
  );
  console.log('Copied apple-touch-icon.png to public/');
}

convert().then(() => console.log('Done!')).catch(console.error);
