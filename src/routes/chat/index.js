const express = require("express");
const router = express.Router();
const validate = require("@src/middleware/validate");
const authMiddleware = require("@src/middleware/auth");

const { sendMessageSchema } = require("@src/validations/chat");
const { sendMessage } = require("@src/controllers/chat/send-message");
const { getConversation } = require("@src/controllers/chat/get-conversation");

router.post("/chat/message", authMiddleware, validate(sendMessageSchema), sendMessage);
router.get("/chat/conversation", authMiddleware, getConversation);

module.exports = router;

