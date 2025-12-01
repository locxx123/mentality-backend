import express from "express";
import { getResources } from "../../controllers/resources/get-resources.js";
import { getResourceById } from "../../controllers/resources/get-resource-by-id.js";
import authMiddleware from "../../middleware/auth.js";

const router = express.Router();

router.get("/resources", authMiddleware, getResources);
router.get("/resources/:id", authMiddleware, getResourceById);

export default router;

