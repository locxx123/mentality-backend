import express from "express";
import authMiddleware from "../../middleware/auth.js";
import { getTrends } from "../../controllers/analytics/get-trends.js";

const router = express.Router();

router.get("/analytics/trends", authMiddleware, getTrends);

export default router;

