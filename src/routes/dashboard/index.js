import express from "express";
import authMiddleware from "../../middleware/auth.js";
import { getDashboardStats } from "../../controllers/dashboard/get-stats.js";
import { getRecentActivities } from "../../controllers/dashboard/get-recent-activities.js";
import { getDashboardGreeting } from "../../controllers/dashboard/get-greeting.js";

const router = express.Router();

router.get("/dashboard/stats", authMiddleware, getDashboardStats);
router.get("/dashboard/greeting", authMiddleware, getDashboardGreeting);
router.get("/dashboard/activities", authMiddleware, getRecentActivities);

export default router;

