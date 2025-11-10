const express = require("express");
const router = express.Router();
const validate = require("@src/middleware/validate");
const authMiddleware = require("@src/middleware/auth");

const { sendMessageSchema } = require("@src/validations/chat");
const { sendMessage } = require("@src/controllers/chat/send-message");
const { getConversation } = require("@src/controllers/chat/get-conversation");
const { createSession } = require("@src/controllers/chat/create-session");
const { getSessions } = require("@src/controllers/chat/get-sessions");

// Session routes
router.post("/chat/sessions", authMiddleware, createSession);
router.get("/chat/sessions", authMiddleware, getSessions);

// Message routes
router.post("/chat/message", authMiddleware, validate(sendMessageSchema), sendMessage);
router.get("/chat/sessions/:sessionId/messages", authMiddleware, getConversation);

module.exports = router;

