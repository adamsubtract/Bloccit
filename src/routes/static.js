const express = require("express");
const router = express.Router();
const staticController = require("../controllers/staticController.js");

router.get("/", staticController.index);

module.exports = router;
