const fs = require('fs');
const { execSync } = require('child_process');

// Determine root directory dynamically whether Vercel builds from root or frontend subfolder
const isSubfolder = !fs.existsSync('backend') && fs.existsSync('../backend');
const rootDir = isSubfolder ? '..' : '.';

console.log(`====================================================`);
console.log(`🛡️ VIGIL Vercel Build Engine`);
console.log(`Working Directory Root: ${rootDir}`);
console.log(`====================================================`);

try {
  console.log('📦 [1/3] Installing backend dependencies...');
  execSync(`npm --prefix ${rootDir}/backend install`, { stdio: 'inherit' });

  console.log('📦 [2/3] Installing frontend dependencies...');
  execSync(`npm --prefix ${rootDir}/frontend install`, { stdio: 'inherit' });

  console.log('⚡ [3/3] Building frontend production bundle...');
  execSync(`npm --prefix ${rootDir}/frontend run build`, { stdio: 'inherit' });

  console.log(`====================================================`);
  console.log(`✅ VIGIL Build Engine Completed Successfully!`);
  console.log(`====================================================`);
} catch (err) {
  console.error('❌ VIGIL Build Engine Error:', err);
  process.exit(1);
}
