const ChatMessage = require("@models/ChatMessage");
const { baseResponse } = require("@src/config/response");

const getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 50 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [messages, total] = await Promise.all([
            ChatMessage.find({ userId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            ChatMessage.countDocuments({ userId }),
        ]);

        // Reverse to show oldest first (chronological order)
        const chronologicalMessages = messages.reverse();

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                messages: chronologicalMessages,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
            msg: "GET_CONVERSATION_SUCCESS",
        });

    } catch (error) {
        console.error("Get conversation error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { getConversation };

