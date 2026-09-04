import puppeteer from "puppeteer-core";

const CHROME =
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const url = process.argv[2] || "http://localhost:3000/";
const width = Number(process.argv[3] || 390);

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: "networkidle0" });

const info = await page.evaluate(() => {
  const docW = document.documentElement.scrollWidth;
  const winW = window.innerWidth;
  const offenders = [];
  const walk = (el) => {
    const r = el.getBoundingClientRect();
    if (r.right > winW + 1 || r.left < -1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className && el.className.toString().slice(0, 80)) || "",
        left: Math.round(r.left),
        right: Math.round(r.right),
        w: Math.round(r.width),
        text: (el.textContent || "").trim().slice(0, 40),
      });
    }
    for (const c of el.children) walk(c);
  };
  walk(document.body);
  return { docW, winW, offenders: offenders.slice(0, 25) };
});

console.log(JSON.stringify(info, null, 2));
await browser.close();
