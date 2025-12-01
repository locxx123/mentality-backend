import express from "express";
import validate from "../../middleware/validate.js";
import authMiddleware from "../../middleware/auth.js";
import { updateProfileSchema } from "../../validations/user/index.js";
import { updateProfile } from "../../controllers/user/update-profile.js";
import { getProfile } from "../../controllers/auth/me.js";
import geminiEmbed from "../../utils/embed.js";

const router = express.Router();

router.get("/auth/me", authMiddleware, getProfile);
router.put("/user/profile", authMiddleware, validate(updateProfileSchema), updateProfile);
router.get("/test", geminiEmbed);

export default router;

