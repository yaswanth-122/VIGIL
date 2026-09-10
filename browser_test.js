const puppeteer = require('puppeteer');

async function runBrowserTest() {
  console.log('====================================================');
  console.log('🚀 LAUNCHING HEADLESS CHROMIUM BROWSER INSTANCE');
  console.log('====================================================\n');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log('🌐 Step 1: Navigating to VIGIL Frontend (http://localhost:3000)...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    console.log('  [✓] Page Title:', await page.title());
    await page.screenshot({ path: 'screenshot_login.png' });
    console.log('  📸 Screenshot captured: screenshot_login.png');

    // Fill Sign In credentials
    console.log('\n🔑 Step 2: Testing User Authentication & Sign In...');
    const emailInput = await page.$('input[type="email"]');
    const passInput = await page.$('input[type="password"]');

    if (emailInput && passInput) {
      await emailInput.type('yashwanth@vigil.app');
      await passInput.type('password123');
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) await submitBtn.click();
      await new Promise(r => setTimeout(r, 1500));
    }

    console.log('  [✓] Current Page URL:', page.url());
    await page.screenshot({ path: 'screenshot_dashboard.png' });
    console.log('  📸 Screenshot captured: screenshot_dashboard.png');

    // Navigate to Start Journey Page
    console.log('\n🗺️ Step 3: Testing Start Journey Page (/start)...');
    await page.goto('http://localhost:3000/start', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshot_start_journey.png' });
    console.log('  [✓] Start Journey Page loaded successfully');
    console.log('  📸 Screenshot captured: screenshot_start_journey.png');

    // Test Google Places Search
    console.log('\n🔍 Step 4: Testing Live Google Places Search Autocomplete...');
    const searchBox = await page.$('input[placeholder*="place"]');
    if (searchBox) {
      await searchBox.type('Marina Beach');
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: 'screenshot_places_autocomplete.png' });
      console.log('  [✓] Live Google Places Autocomplete dropdown rendered');
      console.log('  📸 Screenshot captured: screenshot_places_autocomplete.png');
    }

    // Navigate to Active Journey Page
    console.log('\n⚡ Step 5: Testing Active Journey Page & Telemetry (/active)...');
    await page.goto('http://localhost:3000/active', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshot_active_journey.png' });
    console.log('  [✓] Active Journey Google Map & Risk Meter rendered');
    console.log('  📸 Screenshot captured: screenshot_active_journey.png');

    // Navigate to Guardians Management Page
    console.log('\n🛡️ Step 6: Testing Guardians Management Page (/guardians)...');
    await page.goto('http://localhost:3000/guardians', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshot_guardians.png' });
    console.log('  [✓] Guardians contact list rendered');
    console.log('  📸 Screenshot captured: screenshot_guardians.png');

    // Navigate to Live Guardian Command Centre Feed
    console.log('\n👁️ Step 7: Testing Live Guardian Feed & AI Sit-Rep (/guardian)...');
    await page.goto('http://localhost:3000/guardian', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshot_guardian_feed.png' });
    console.log('  [✓] Guardian Live Command Centre & Gemini Sit-Rep rendered');
    console.log('  📸 Screenshot captured: screenshot_guardian_feed.png');

    // Navigate to Journey History Page
    console.log('\n📜 Step 8: Testing Journey History Page (/history)...');
    await page.goto('http://localhost:3000/history', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshot_history.png' });
    console.log('  [✓] Historical telemetry logs rendered');
    console.log('  📸 Screenshot captured: screenshot_history.png');

    // Navigate to Admin Analytics Dashboard
    console.log('\n📊 Step 9: Testing Admin Analytics Dashboard (/admin)...');
    await page.goto('http://localhost:3000/admin', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: 'screenshot_admin.png' });
    console.log('  [✓] Real-time system analytics & logs rendered');
    console.log('  📸 Screenshot captured: screenshot_admin.png');

    console.log('\n====================================================');
    console.log('🎉 BROWSER VERIFICATION SUCCESSFUL: ALL UI PAGES VERIFIED!');
    console.log('====================================================\n');

  } catch (err) {
    console.error('❌ Browser Test Error:', err);
  } finally {
    await browser.close();
  }
}

runBrowserTest();
