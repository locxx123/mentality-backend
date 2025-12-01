import Emotion from "../../models/Emotion.js";
import ChatMessage from "../../models/ChatMessage.js";
import { baseResponse } from "../../config/response.js";

const getRecentActivities = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 10;

        // Lấy emotions gần đây
        const recentEmotions = await Emotion.find({ userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("emotionType journalEntry createdAt date");

        // Lấy chat messages gần đây (chỉ user messages)
        const recentChatMessages = await ChatMessage.find({
            userId,
            isFromUser: true
        })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("message createdAt");

        // Kết hợp và sắp xếp theo thời gian
        const activities = [];

        // Thêm emotions vào activities
        recentEmotions.forEach(emotion => {
            const emotionLabels = {
                happy: "vui",
                sad: "buồn",
                loved: "yêu thương",
                anxious: "lo lắng",
                angry: "tức giận",
                tired: "mệt mỏi",
                calm: "bình yên",
                confused: "bối rối"
            };

            const emotionLabel = emotionLabels[emotion.emotionType] || emotion.emotionType;
            const description = emotion.journalEntry 
                ? `Cảm thấy ${emotionLabel}: ${emotion.journalEntry.substring(0, 50)}${emotion.journalEntry.length > 50 ? '...' : ''}`
                : `Cảm thấy ${emotionLabel}`;

            activities.push({
                type: "emotion",
                action: `Bạn chia sẻ cảm xúc: ${description}`,
                timestamp: emotion.createdAt || emotion.date,
            });
        });

        // Thêm chat messages vào activities
        recentChatMessages.forEach(message => {
            activities.push({
                type: "chat",
                action: `Bạn đã trò chuyện với AI: ${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}`,
                timestamp: message.createdAt,
            });
        });

        // Sắp xếp theo timestamp giảm dần
        activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Format timestamp thành tiếng Việt
        const formatTimestamp = (timestamp) => {
            const now = new Date();
            const time = new Date(timestamp);
            const diffMs = now - time;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            // Kiểm tra cùng ngày
            const isToday = time.toDateString() === now.toDateString();
            const isYesterday = time.toDateString() === new Date(now.getTime() - 86400000).toDateString();

            if (diffMins < 1) {
                return "Vừa xong";
            } else if (diffMins < 60) {
                return `${diffMins} phút trước`;
            } else if (diffHours < 24 && isToday) {
                return `Hôm nay lúc ${time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
            } else if (isYesterday) {
                return `Hôm qua lúc ${time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
            } else if (diffDays < 7) {
                return `${diffDays} ngày trước`;
            } else {
                return time.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                });
            }
        };

        const formattedActivities = activities.slice(0, limit).map(activity => ({
            action: activity.action,
            time: formatTimestamp(activity.timestamp),
            timestamp: activity.timestamp,
        }));

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                activities: formattedActivities,
            },
            msg: "GET_RECENT_ACTIVITIES_SUCCESS",
        });

    } catch (error) {
        console.error("Get recent activities error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

export { getRecentActivities };