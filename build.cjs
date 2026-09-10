const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const isSubfolder = !fs.existsSync('backend') && fs.existsSync('../backend');
const rootDir = isSubfolder ? '..' : '.';

console.log(`====================================================`);
console.log(`🛡️ VIGIL Build Engine`);
console.log(`Working Directory Root: ${path.resolve(rootDir)}`);
console.log(`====================================================`);

try {
  const backendPkg = path.join(rootDir, 'backend/package.json');
  if (fs.existsSync(backendPkg)) {
    console.log('📦 [1/3] Installing backend dependencies...');
    execSync(`npm --prefix ${rootDir}/backend install`, { stdio: 'inherit' });
  } else {
    console.log('📦 [1/3] Backend package.json not found in subfolder, using root dependencies.');
  }

  const frontendPkg = path.join(rootDir, 'frontend/package.json');
  if (fs.existsSync(frontendPkg)) {
    console.log('📦 [2/3] Installing frontend dependencies...');
    execSync(`npm --prefix ${rootDir}/frontend install`, { stdio: 'inherit' });

    console.log('⚡ [3/3] Building frontend production bundle...');
    execSync(`npm --prefix ${rootDir}/frontend run build`, { stdio: 'inherit' });
  } else if (fs.existsSync('package.json')) {
    console.log('⚡ [3/3] Building frontend bundle from root...');
    execSync('npm run build', { stdio: 'inherit' });
  }

  console.log(`====================================================`);
  console.log(`✅ VIGIL Build Engine Completed Successfully!`);
  console.log(`====================================================`);
} catch (err) {
  console.error('❌ VIGIL Build Engine Error:', err);
  process.exit(1);
}
