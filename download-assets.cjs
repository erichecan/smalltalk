const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

const htmlDir = path.join(__dirname, 'original-html');
const assetDir = path.join(__dirname, 'public/assets');
if (!fs.existsSync(assetDir)) fs.mkdirSync(assetDir, { recursive: true });

const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/g;
const bgRegex = /background-image:\s*url\(['"]?([^"')]+)['"]?\)/g;
const linkRegex = /<link[^>]+href=["']([^"'>]+)["']/g;

function getHashedFilename(url) {
  const hash = crypto.createHash('sha1').update(url).digest('hex');
  const ext = path.extname(url.split('?')[0]) || '.img';
  return `${hash}${ext}`;
}

async function download(url, dest) {
  try {
    const res = await axios({ url, responseType: 'stream' });
    const writer = fs.createWriteStream(dest);
    res.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (e) {
    console.log('Failed to download:', url);
  }
}

(async () => {
  const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
  const urls = new Set();
  for (const file of files) {
    const html = fs.readFileSync(path.join(htmlDir, file), 'utf-8');
    let m;
    while ((m = imgRegex.exec(html))) urls.add(m[1]);
    while ((m = bgRegex.exec(html))) urls.add(m[1]);
    while ((m = linkRegex.exec(html))) urls.add(m[1]);
  }
  for (const url of urls) {
    if (!/^https?:/.test(url)) continue;
    const filename = getHashedFilename(url);
    const dest = path.join(assetDir, filename);
    await download(url, dest);
    console.log('Downloaded:', url, '->', dest);
  }
})(); 