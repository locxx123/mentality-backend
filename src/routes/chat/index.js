import express from "express";
import validate from "../../middleware/validate.js";
import authMiddleware from "../../middleware/auth.js";
import { sendMessageSchema } from "../../validations/chat/index.js";
import { sendMessage } from "../../controllers/chat/send-message.js";
import { getConversation } from "../../controllers/chat/get-conversation.js";
import { createSession } from "../../controllers/chat/create-session.js";
import { getSessions } from "../../controllers/chat/get-sessions.js";

const router = express.Router();

// Session routes
router.post("/chat/sessions", authMiddleware, createSession);
router.get("/chat/sessions", authMiddleware, getSessions);

// Message routes
router.post("/chat/message", authMiddleware, validate(sendMessageSchema), sendMessage);
router.get("/chat/sessions/:sessionId/messages", authMiddleware, getConversation);

export default router;

