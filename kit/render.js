const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const [file, prefix, scale] = process.argv.slice(2);
  const out = path.join(__dirname, 'out'); fs.mkdirSync(out, { recursive: true });
  const opts = { args: ['--allow-file-access-from-files'] };
  if (fs.existsSync('/opt/pw-browsers/chromium')) opts.executablePath = '/opt/pw-browsers/chromium';
  let b;
  try { b = await chromium.launch(opts); } catch (e) { delete opts.executablePath; b = await chromium.launch(opts); }
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: +(scale || 1) });
  await p.goto('file://' + path.resolve(__dirname, file));
  await p.waitForSelector('body[data-ready="1"]', { timeout: 15000 });
  await p.waitForTimeout(300);
  const slides = await p.$$('section.slide');
  for (let i = 0; i < slides.length; i++) {
    await slides[i].screenshot({ path: path.join(out, `${prefix}_${i + 1}.png`) });
  }
  await b.close();
  console.log('rendered', slides.length);
})();
