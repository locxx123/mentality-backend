import express from "express";
import authMiddleware from "../../middleware/auth.js";
import { getRelaxVideos } from "../../controllers/relax/get-videos.js";

const router = express.Router();

router.get("/relax/videos", authMiddleware, getRelaxVideos);

export default router;

