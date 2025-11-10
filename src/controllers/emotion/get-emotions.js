const Emotion = require("@models/Emotion");
const { baseResponse } = require("@src/config/response");

const getEmotions = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 20, startDate, endDate, emotionType } = req.query;

        const query = { userId };
        
        // Filter by date range
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }

        // Filter by emotion type
        if (emotionType) {
            query.emotionType = emotionType;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [emotions, total] = await Promise.all([
            Emotion.find(query)
                .sort({ date: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Emotion.countDocuments(query),
        ]);

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                emotions,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    totalPages: Math.ceil(total / parseInt(limit)),
                },
            },
            msg: "GET_EMOTIONS_SUCCESS",
        });

    } catch (error) {
        console.error("Get emotions error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { getEmotions };

