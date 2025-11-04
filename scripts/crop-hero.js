// Crop left/right margins of the hero image to reduce empty space
// Usage: node scripts/crop-hero.js

const path = require('path');
const fs = require('fs');

async function run() {
  const input = path.resolve(__dirname, '..', 'public', 'img', 'default', 'c4e6e55976d30941f6b05db9408fc510199ce20f.png');
  const output = path.resolve(__dirname, '..', 'public', 'img', 'default', 'hero-login.png');

  const sharp = require('sharp');
  const image = sharp(input);
  const meta = await image.metadata();

  const originalWidth = meta.width || 0;
  const originalHeight = meta.height || 0;
  if (!originalWidth || !originalHeight) {
    throw new Error('Failed to read image metadata.');
  }

  // Symmetric crop: remove small margins on both sides equally
  // Keep ~84% of width (≈8% trimmed from each side)
  const keepRatio = 0.84;
  const newWidth = Math.round(originalWidth * keepRatio);
  const left = Math.max(0, Math.round((originalWidth - newWidth) / 2));

  await sharp(input)
    .extract({ left, top: 0, width: newWidth, height: originalHeight })
    .toFile(output);

  // Ensure file exists
  if (!fs.existsSync(output)) {
    throw new Error('Output file was not created.');
  }

  console.log('Cropped hero saved to:', output);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


