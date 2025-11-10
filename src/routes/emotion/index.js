const express = require("express");
const router = express.Router();
const validate = require("@src/middleware/validate");
const authMiddleware = require("@src/middleware/auth");

const { createEmotionSchema, updateEmotionSchema } = require("@src/validations/emotion");
const { createEmotion } = require("@src/controllers/emotion/create-emotion");
const { getEmotions } = require("@src/controllers/emotion/get-emotions");
const { getEmotionById } = require("@src/controllers/emotion/get-emotion-by-id");
const { updateEmotion } = require("@src/controllers/emotion/update-emotion");
const { deleteEmotion } = require("@src/controllers/emotion/delete-emotion");

router.post("/emotions", authMiddleware, validate(createEmotionSchema), createEmotion);
router.get("/emotions", authMiddleware, getEmotions);
router.get("/emotions/:id", authMiddleware, getEmotionById);
router.put("/emotions/:id", authMiddleware, validate(updateEmotionSchema), updateEmotion);
router.delete("/emotions/:id", authMiddleware, deleteEmotion);

module.exports = router;

