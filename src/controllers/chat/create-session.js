const ChatSession = require("@models/ChatSession");
const { baseResponse } = require("@src/config/response");

const createSession = async (req, res) => {
    try {
        const userId = req.user._id;

        const newSession = new ChatSession({
            userId,
            title: "Cuộc trò chuyện mới",
            lastMessageAt: new Date(),
        });

        await newSession.save();

        return baseResponse(res, {
            success: true,
            statusCode: 201,
            data: newSession,
            msg: "SESSION_CREATED_SUCCESS",
        });

    } catch (error) {
        console.error("Create session error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { createSession };

