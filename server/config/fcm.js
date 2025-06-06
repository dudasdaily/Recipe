//Firebase 초기화 모듈
const admin = require("firebase-admin");
const serviceAccount = require("./firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;