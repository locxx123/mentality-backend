import Emotion from "../../models/Emotion.js";
import { baseResponse } from "../../config/response.js";
import { transformEmotion } from "../../utils/transformEmotion.js";

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

        const normalizedEmotion = transformEmotion(emotion);

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: normalizedEmotion,
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

export { getEmotionById };

