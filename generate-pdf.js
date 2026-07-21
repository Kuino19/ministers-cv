const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const htmlPath = 'file://' + path.resolve('C:/Users/IFEDAYO LAWAL/Desktop/cv-preview.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle0' });
  await page.pdf({ path: 'C:/Users/IFEDAYO LAWAL/Desktop/cv-preview.pdf', format: 'A4' });
  await browser.close();
  console.log("PDF generated at C:/Users/IFEDAYO LAWAL/Desktop/cv-preview.pdf");
})();
