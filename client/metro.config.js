const { getDefaultConfig } = require('expo/metro-config');

// Metro 번들러에서 dotenv 환경 변수 로드
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname, {
  isCSSEnabled: true,
});

module.exports = config; 