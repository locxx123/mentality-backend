const ChatSession = require("@models/ChatSession");
const { baseResponse } = require("@src/config/response");

const getSessions = async (req, res) => {
    try {
        const userId = req.user._id;

        const sessions = await ChatSession.find({ userId })
            .sort({ lastMessageAt: -1 })
            .limit(50);

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                sessions,
            },
            msg: "GET_SESSIONS_SUCCESS",
        });

    } catch (error) {
        console.error("Get sessions error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { getSessions };

