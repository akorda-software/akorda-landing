/**
 * Capturas de revisión con Chrome del sistema.
 * Uso: bun scripts/shot.mjs <url> <salida.png> [--width=1440] [--scroll=0] [--full] [--mobile]
 */
import puppeteer from 'puppeteer-core';

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
const get = (name, def) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.split('=')[1] : def;
};

const mobile = args.includes('--mobile');
const full = args.includes('--full');
const width = Number(get('width', mobile ? '390' : '1440'));
const scrollY = Number(get('scroll', '0'));

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width, height: mobile ? 844 : 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

// Recorrer la página despacio para disparar los reveals (Lenis suaviza el scroll)
await page.evaluate(async () => {
  const h = document.body.scrollHeight;
  for (let y = 0; y <= h; y += 350) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 220));
  }
});

await page.evaluate((y) => window.scrollTo(0, y), scrollY);
// Dejar que la entrada del hero y las transiciones terminen
await new Promise((r) => setTimeout(r, 1500));

await page.screenshot({ path: out, fullPage: full });
await browser.close();
console.log('OK', out);
