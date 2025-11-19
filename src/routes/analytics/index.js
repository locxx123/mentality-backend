import express from "express";
import authMiddleware from "../../middleware/auth.js";
import { getTrends, getTrendsInsights } from "../../controllers/analytics/get-trends.js";

const router = express.Router();

router.get("/analytics/trends", authMiddleware, getTrends);
router.get("/analytics/trends/insights", authMiddleware, getTrendsInsights);

export default router;

