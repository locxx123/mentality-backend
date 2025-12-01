import ChatMessage from "../../models/ChatMessage.js";
import { baseResponse } from "../../config/response.js";

const getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { sessionId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        if (!sessionId) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "SESSION_ID_REQUIRED",
            });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [messages, total] = await Promise.all([
            ChatMessage.find({ userId, sessionId })
                .sort({ createdAt: 1 }) // Sort ascending để hiển thị từ cũ đến mới
                .skip(skip)
                .limit(parseInt(limit)),
            ChatMessage.countDocuments({ userId, sessionId }),
        ]);

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                messages,
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

export { getConversation };

