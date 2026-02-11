const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG icon with book + sparkles design
function generateSVG(size, maskable = false) {
  const padding = maskable ? Math.round(size * 0.2) : Math.round(size * 0.1);
  const innerSize = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7C3AED"/>
      <stop offset="100%" style="stop-color:#A855F7"/>
    </linearGradient>
  </defs>
  ${maskable ? `<rect width="${size}" height="${size}" fill="url(#bg)" rx="0"/>` : `<rect width="${size}" height="${size}" fill="url(#bg)" rx="${Math.round(size * 0.18)}"/>`}
  <g transform="translate(${cx}, ${cy}) scale(${innerSize / 100})">
    <!-- Book -->
    <path d="M-30 -20 C-30 -22 -28 -24 -26 -24 L-2 -24 C0 -24 0 -22 0 -20 L0 24 C0 22 -2 20 -4 20 L-26 20 C-28 20 -30 18 -30 16 Z" fill="white" opacity="0.95"/>
    <path d="M30 -20 C30 -22 28 -24 26 -24 L2 -24 C0 -24 0 -22 0 -20 L0 24 C0 22 2 20 4 20 L26 20 C28 20 30 18 30 16 Z" fill="white" opacity="0.85"/>
    <!-- Book lines -->
    <line x1="-24" y1="-14" x2="-6" y2="-14" stroke="#A855F7" stroke-width="2" stroke-linecap="round"/>
    <line x1="-24" y1="-6" x2="-6" y2="-6" stroke="#C084FC" stroke-width="2" stroke-linecap="round"/>
    <line x1="-24" y1="2" x2="-12" y2="2" stroke="#C084FC" stroke-width="2" stroke-linecap="round"/>
    <!-- Sparkles -->
    <circle cx="20" cy="-30" r="3" fill="#FBBF24"/>
    <circle cx="28" cy="-18" r="2" fill="#FBBF24"/>
    <circle cx="-28" cy="-32" r="2.5" fill="#FCD34D"/>
    <circle cx="14" cy="-36" r="1.5" fill="#FDE68A"/>
    <!-- Star -->
    <path d="M22 -8 L23.5 -3 L28.5 -3 L24.5 0.5 L26 5.5 L22 2.5 L18 5.5 L19.5 0.5 L15.5 -3 L20.5 -3 Z" fill="#FBBF24"/>
  </g>
</svg>`;
}

// Use sharp if available, otherwise create SVGs that browsers can use
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Try to convert SVGs to PNGs using canvas
let hasCanvas = false;
try {
  require('canvas');
  hasCanvas = true;
} catch (e) {
  // canvas not available
}

// Generate SVG files and a simple conversion script
for (const size of sizes) {
  const svg = generateSVG(size, false);
  const svgPath = path.join(iconsDir, `icon-${size}.svg`);
  fs.writeFileSync(svgPath, svg);

  // Also write as .png placeholder (SVG content, will work in most browsers)
  // We'll use a proper conversion below
}

// Generate maskable versions
for (const size of [192, 512]) {
  const svg = generateSVG(size, true);
  const svgPath = path.join(iconsDir, `icon-maskable-${size}.svg`);
  fs.writeFileSync(svgPath, svg);
}

// Create an HTML page that converts SVGs to PNGs
const converterHtml = `<!DOCTYPE html>
<html>
<head><title>Icon Generator</title></head>
<body>
<script>
const sizes = ${JSON.stringify(sizes)};
const maskableSizes = [192, 512];

async function convert() {
  for (const size of sizes) {
    await convertSvg(\`/icons/icon-\${size}.svg\`, \`icon-\${size}.png\`, size);
  }
  for (const size of maskableSizes) {
    await convertSvg(\`/icons/icon-maskable-\${size}.svg\`, \`icon-maskable-\${size}.png\`, size);
  }
  document.body.innerHTML = '<h1>Done! Icons generated.</h1>';
}

async function convertSvg(svgUrl, filename, size) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, size, size);
      const link = document.createElement('a');
      link.download = filename;
      link.href = canvas.toDataURL('image/png');
      link.click();
      resolve();
    };
    img.src = svgUrl;
  });
}

convert();
</script>
</body>
</html>`;
fs.writeFileSync(path.join(iconsDir, 'converter.html'), converterHtml);

console.log('SVG icons generated successfully!');
console.log('Sizes:', sizes.join(', '));
console.log('Maskable: 192, 512');
