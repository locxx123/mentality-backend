const express = require("express");
const router = express.Router();
const authMiddleware = require("@src/middleware/auth");

const { getTrends } = require("@src/controllers/analytics/get-trends");

router.get("/analytics/trends", authMiddleware, getTrends);

module.exports = router;

