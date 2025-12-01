import express from "express";
import authRoutes from "./auth/index.js";
import emotionRoutes from "./emotion/index.js";
import chatRoutes from "./chat/index.js";
import analyticsRoutes from "./analytics/index.js";
import resourcesRoutes from "./resources/index.js";
import userRoutes from "./user/index.js";
import dashboardRoutes from "./dashboard/index.js";
import relaxRoutes from "./relax/index.js";

const router = express.Router();

router.use(authRoutes);
router.use(emotionRoutes);
router.use(chatRoutes);
router.use(analyticsRoutes);
router.use(resourcesRoutes);
router.use(userRoutes);
router.use(dashboardRoutes);
router.use(relaxRoutes);

export default router;
