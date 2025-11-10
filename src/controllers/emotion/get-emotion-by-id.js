const Emotion = require("@models/Emotion");
const { baseResponse } = require("@src/config/response");

const getEmotionById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const emotion = await Emotion.findOne({ _id: id, userId });

        if (!emotion) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: "EMOTION_NOT_FOUND",
            });
        }

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: emotion,
            msg: "GET_EMOTION_SUCCESS",
        });

    } catch (error) {
        console.error("Get emotion by id error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { getEmotionById };

