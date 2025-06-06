const express = require("express");
const router = express.Router();
const fcmController = require("../controllers/fcmController");

router.post("/register", fcmController.registerToken);

module.exports = router;
