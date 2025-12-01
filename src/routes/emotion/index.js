import express from "express";
import validate from "../../middleware/validate.js";
import authMiddleware from "../../middleware/auth.js";
import { createEmotionSchema, updateEmotionSchema } from "../../validations/emotion/index.js";
import { createEmotion } from "../../controllers/emotion/create-emotion.js";
import { getEmotions } from "../../controllers/emotion/get-emotions.js";
import { getEmotionById } from "../../controllers/emotion/get-emotion-by-id.js";
import { updateEmotion } from "../../controllers/emotion/update-emotion.js";
import { deleteEmotion } from "../../controllers/emotion/delete-emotion.js";

const router = express.Router();

router.post("/emotions", authMiddleware, validate(createEmotionSchema), createEmotion);
router.get("/emotions", authMiddleware, getEmotions);
router.get("/emotions/:id", authMiddleware, getEmotionById);
router.put("/emotions/:id", authMiddleware, validate(updateEmotionSchema), updateEmotion);
router.delete("/emotions/:id", authMiddleware, deleteEmotion);

export default router;

