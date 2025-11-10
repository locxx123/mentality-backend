const express = require("express");
const router = express.Router();
const authMiddleware = require("@src/middleware/auth");

const { getDashboardStats } = require("@src/controllers/dashboard/get-stats");
const { getRecentActivities } = require("@src/controllers/dashboard/get-recent-activities");

router.get("/dashboard/stats", authMiddleware, getDashboardStats);
router.get("/dashboard/activities", authMiddleware, getRecentActivities);

module.exports = router;

