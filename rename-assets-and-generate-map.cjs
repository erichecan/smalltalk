const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { fileTypeFromFile } = require('file-type');

const assetDir = path.join(__dirname, 'public/assets');
const mapFile = path.join(__dirname, 'assets-map.json');
const urlToHash = new Map();

// 读取 download-assets.cjs 生成的 hash 映射（通过重新遍历 original-html 提取）
const htmlDir = path.join(__dirname, 'original-html');
const imgRegex = /<img[^>]+src=["']([^"'>]+)["']/g;
const bgRegex = /background-image:\s*url\(['"]?([^"')]+)['"]?\)/g;
const linkRegex = /<link[^>]+href=["']([^"'>]+)["']/g;

function getHashedFilename(url) {
  const hash = crypto.createHash('sha1').update(url).digest('hex');
  return hash;
}

// 1. 生成 url->hash 映射
const files = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
for (const file of files) {
  const html = fs.readFileSync(path.join(htmlDir, file), 'utf-8');
  let m;
  while ((m = imgRegex.exec(html))) urlToHash.set(m[1], getHashedFilename(m[1]));
  while ((m = bgRegex.exec(html))) urlToHash.set(m[1], getHashedFilename(m[1]));
  while ((m = linkRegex.exec(html))) urlToHash.set(m[1], getHashedFilename(m[1]));
}

(async () => {
  const map = {};
  for (const [url, hash] of urlToHash.entries()) {
    const imgPath = path.join(assetDir, hash + '.img');
    if (!fs.existsSync(imgPath)) continue;
    let ext = '.img';
    let type;
    try {
      const ft = await fileTypeFromFile(imgPath);
      if (ft) {
        ext = '.' + ft.ext;
        type = ft.mime;
      } else {
        // 可能是 svg/ico 等文本型
        const buf = fs.readFileSync(imgPath);
        const str = buf.toString('utf8', 0, 100).trim();
        if (str.startsWith('<svg')) ext = '.svg';
        else if (str.startsWith('GIF8')) ext = '.gif';
        else if (str.startsWith('<?xml') && str.includes('svg')) ext = '.svg';
        else if (str.startsWith('data:image/svg+xml')) ext = '.svg';
        else if (str.startsWith('ICO') || str.includes('icon')) ext = '.ico';
        else ext = '.img';
      }
    } catch (e) {
      ext = '.img';
    }
    const newName = hash + ext;
    const newPath = path.join(assetDir, newName);
    if (imgPath !== newPath) fs.renameSync(imgPath, newPath);
    map[url] = {
      hash,
      ext,
      filename: newName,
      path: 'public/assets/' + newName
    };
  }
  fs.writeFileSync(mapFile, JSON.stringify(map, null, 2), 'utf-8');
  console.log('重命名完成，映射表已生成：', mapFile);
})(); 