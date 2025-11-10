const ChatMessage = require("@models/ChatMessage");
const { baseResponse } = require("@src/config/response");
const { analyzeSentiment, generateResponse } = require("@services/ai-chat");

const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;

        if (!message || message.trim().length === 0) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "MESSAGE_REQUIRED",
            });
        }

        // Analyze sentiment
        const sentimentAnalysis = analyzeSentiment(message);

        // Save user message
        const userMessage = new ChatMessage({
            userId,
            message: message.trim(),
            isFromUser: true,
            sentiment: sentimentAnalysis.sentiment,
            sentimentScore: sentimentAnalysis.score,
        });
        await userMessage.save();

        // Generate AI response
        const aiResponse = generateResponse(message, sentimentAnalysis.sentiment);

        // Save AI response
        const aiMessage = new ChatMessage({
            userId,
            message: aiResponse,
            isFromUser: false,
        });
        await aiMessage.save();

        return baseResponse(res, {
            success: true,
            statusCode: 201,
            data: {
                userMessage,
                aiMessage,
                sentiment: sentimentAnalysis,
            },
            msg: "MESSAGE_SENT_SUCCESS",
        });

    } catch (error) {
        console.error("Send message error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { sendMessage };

