const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '../assets/images');

// 기본 1x1 투명 PNG 이미지 (Base64)
const TRANSPARENT_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// 필요한 이미지 파일들
const REQUIRED_IMAGES = [
  'icon.png',
  'splash.png',
  'adaptive-icon.png',
  'favicon.png'
];

// 디렉토리가 없으면 생성
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// 각 이미지 파일 생성
REQUIRED_IMAGES.forEach(filename => {
  const filePath = path.join(IMAGES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, Buffer.from(TRANSPARENT_PNG, 'base64'));
    console.log(`Created ${filename}`);
  }
});

console.log('Asset creation complete!'); 