import Emotion from "../../models/Emotion.js";
import ChatSession from "../../models/ChatSession.js";
import { baseResponse } from "../../config/response.js";

const getDashboardStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Tính toán ngày hôm nay (start và end)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Tính toán tuần này (7 ngày gần nhất)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        // 1. Cảm xúc hôm nay (emotion mới nhất hôm nay)
        const todayEmotion = await Emotion.findOne({
            userId,
            date: { $gte: today, $lt: tomorrow }
        }).sort({ date: -1 });

        // 2. Tổng số nhật ký ghi chép
        const totalJournalEntries = await Emotion.countDocuments({ userId });

        // 3. Tuần này - số ngày tốt (moodRating >= 4)
        const goodDaysThisWeek = await Emotion.distinct("date", {
            userId,
            date: { $gte: weekAgo },
            moodRating: { $gte: 4 }
        });

        // 4. Số phiên chatbot
        const totalChatSessions = await ChatSession.countDocuments({ userId });

        // Format cảm xúc hôm nay
        let todayEmotionDisplay = "😊";
        if (todayEmotion) {
            const emotionEmojis = {
                happy: "😊",
                sad: "😢",
                loved: "❤️",
                anxious: "😰",
                angry: "😠",
                tired: "😴",
                calm: "😌",
                confused: "😕"
            };
            todayEmotionDisplay = emotionEmojis[todayEmotion.emotionType] || "😊";
        }

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                stats: {
                    todayEmotion: todayEmotionDisplay,
                    journalEntries: totalJournalEntries,
                    goodDaysThisWeek: goodDaysThisWeek.length,
                    chatSessions: totalChatSessions,
                },
            },
            msg: "GET_DASHBOARD_STATS_SUCCESS",
        });

    } catch (error) {
        console.error("Get dashboard stats error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

export { getDashboardStats };

