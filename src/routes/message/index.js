const express = require("express");
const router = express.Router();
const { getMessages } = require("@src/controllers/message/get-message");
const authMiddleware = require("@src/middleware/auth");
const { sendMessage } = require("@src/controllers/message/send-message");
const { getChatList } = require("@src/controllers/message/get-last-list");


router.get("/message/:id", authMiddleware , getMessages);
router.get("/get-chat-list", authMiddleware , getChatList);
router.post("/send/:id", authMiddleware, sendMessage);

module.exports = router;