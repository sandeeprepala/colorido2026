import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('========================================================');
console.log('🚀 COLORIDO \'26 — Cloudinary Image Uploader & Optimizer');
console.log('========================================================\n');

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Missing Cloudinary credentials in backend/.env!');
  console.error('Please add the following to your backend/.env file:');
  console.error('  CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.error('  CLOUDINARY_API_KEY=your_api_key');
  console.error('  CLOUDINARY_API_SECRET=your_api_secret\n');
  process.exit(1);
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

async function uploadFolder(localDir, cloudinaryFolder) {
  if (!fs.existsSync(localDir)) {
    console.warn(`⚠️ Directory not found: ${localDir}`);
    return;
  }

  const files = fs.readdirSync(localDir);
  console.log(`📁 Found ${files.length} files in ${path.basename(localDir)} to upload to "${cloudinaryFolder}"...\n`);

  let totalOriginalSize = 0;

  for (const file of files) {
    const fullPath = path.join(localDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) continue;

    // Filter for image types
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'].includes(ext)) {
      continue;
    }

    totalOriginalSize += stat.size;
    const nameWithoutExt = path.basename(file, ext);
    const sizeMB = (stat.size / (1024 * 1024)).toFixed(2);

    process.stdout.write(`⏳ Uploading "${file}" (${sizeMB} MB)... `);

    try {
      const result = await cloudinary.uploader.upload(fullPath, {
        folder: cloudinaryFolder,
        public_id: nameWithoutExt,
        overwrite: true,
        resource_type: 'image',
      });

      console.log(`✅ Done!`);
      console.log(`   🔗 CDN URL: ${result.secure_url}`);
    } catch (err) {
      console.log(`❌ Failed: ${err.message}`);
    }
  }

  console.log(`\n✨ Total uploaded data: ${(totalOriginalSize / (1024 * 1024)).toFixed(2)} MB`);
}

async function main() {
  const galleryDir = path.resolve(__dirname, '../../../frontend/public/gallery');
  const assetsDir = path.resolve(__dirname, '../../../frontend/public/assets');

  console.log('1️⃣ Uploading Gallery Photos...');
  await uploadFolder(galleryDir, 'colorido2026/gallery');

  console.log('\n2️⃣ Uploading Festival Art Assets...');
  await uploadFolder(assetsDir, 'colorido2026/assets');

  console.log('\n🎉 ALL IMAGES UPLOADED TO CLOUDINARY SUCCESSFULLY!');
  console.log('Next Steps:');
  console.log('1. Ensure VITE_CLOUDINARY_CLOUD_NAME is set in frontend/.env with:');
  console.log(`   VITE_CLOUDINARY_CLOUD_NAME=${cloudName}`);
  console.log('2. The frontend will now automatically stream images via high-speed Cloudinary CDN with f_auto and q_auto!\n');
}

main().catch((err) => {
  console.error('Fatal error during upload:', err);
  process.exit(1);
});
