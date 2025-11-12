import Emotion from "../../models/Emotion.js";
import { baseResponse } from "../../config/response.js";

// Emotion config matching frontend
const EMOTION_CONFIG = {
    happy: { emoji: "😊", label: "Vui vẻ", category: "positive" },
    sad: { emoji: "😔", label: "Buồn", category: "negative" },
    loved: { emoji: "😍", label: "Yêu thích", category: "positive" },
    anxious: { emoji: "😰", label: "Lo lắng", category: "negative" },
    angry: { emoji: "😠", label: "Tức giận", category: "negative" },
    tired: { emoji: "😴", label: "Mệt mỏi", category: "neutral" },
    calm: { emoji: "😌", label: "Bình tĩnh", category: "positive" },
    confused: { emoji: "😕", label: "Bối rối", category: "neutral" },
};

const EMOTION_ORDER = ['happy', 'calm', 'loved', 'anxious', 'tired', 'angry', 'sad', 'confused'];

const getTrends = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = 'week' } = req.query; // week, month, year

        let startDate = new Date();
        let previousPeriodStartDate = new Date();

        switch (period) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - 14);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                previousPeriodStartDate.setMonth(previousPeriodStartDate.getMonth() - 2);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                previousPeriodStartDate.setFullYear(previousPeriodStartDate.getFullYear() - 2);
                break;
        }

        // Get emotions in current and previous period for trend comparison
        const [currentEmotions, previousEmotions] = await Promise.all([
            Emotion.find({
                userId,
                date: { $gte: startDate },
            }).sort({ date: 1 }),
            Emotion.find({
                userId,
                date: { $gte: previousPeriodStartDate, $lt: startDate },
            }).sort({ date: 1 }),
        ]);

        // Calculate emotion counts for current period
        const emotionCounts = {};
        const moodRatings = [];
        const emotionByType = {};

        currentEmotions.forEach(emotion => {
            emotionCounts[emotion.emotionType] = (emotionCounts[emotion.emotionType] || 0) + 1;
            moodRatings.push(emotion.moodRating);
            if (!emotionByType[emotion.emotionType]) {
                emotionByType[emotion.emotionType] = [];
            }
            emotionByType[emotion.emotionType].push(emotion.moodRating);
        });

        // Calculate previous period counts for trends
        const previousEmotionCounts = {};
        previousEmotions.forEach(emotion => {
            previousEmotionCounts[emotion.emotionType] = (previousEmotionCounts[emotion.emotionType] || 0) + 1;
        });

        const totalEmotions = currentEmotions.length;
        const averageMood = moodRatings.length > 0
            ? parseFloat((moodRatings.reduce((a, b) => a + b, 0) / moodRatings.length).toFixed(2))
            : 0;

        // Calculate positive, negative, neutral counts
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;

        Object.keys(emotionCounts).forEach(type => {
            const config = EMOTION_CONFIG[type];
            if (config) {
                if (config.category === 'positive') {
                    positiveCount += emotionCounts[type];
                } else if (config.category === 'negative') {
                    negativeCount += emotionCounts[type];
                } else {
                    neutralCount += emotionCounts[type];
                }
            }
        });

        // Build emotion stats with trends
        const emotionStats = EMOTION_ORDER.map(type => {
            const config = EMOTION_CONFIG[type];
            const count = emotionCounts[type] || 0;
            const previousCount = previousEmotionCounts[type] || 0;
            const trend = count - previousCount;
            const percentage = totalEmotions > 0 ? Math.round((count / totalEmotions) * 100) : 0;

            return {
                emotion: config.label,
                emoji: config.emoji,
                count,
                percentage,
                trend,
            };
        }).filter(stat => stat.count > 0); // Only show emotions that have records

        // Group by date for daily mood chart
        const dailyMoodData = {};
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

        currentEmotions.forEach(emotion => {
            const date = new Date(emotion.date);
            const dayOfWeek = date.getDay();
            const dayName = dayNames[dayOfWeek];
            const config = EMOTION_CONFIG[emotion.emotionType];

            if (!dailyMoodData[dayName]) {
                dailyMoodData[dayName] = { date: dayName, positive: 0, neutral: 0, negative: 0 };
            }

            if (config) {
                if (config.category === 'positive') {
                    dailyMoodData[dayName].positive++;
                } else if (config.category === 'negative') {
                    dailyMoodData[dayName].negative++;
                } else {
                    dailyMoodData[dayName].neutral++;
                }
            }
        });

        // Convert to array and ensure all days are present
        const dailyMoodArray = dayNames.map(dayName => 
            dailyMoodData[dayName] || { date: dayName, positive: 0, neutral: 0, negative: 0 }
        );

        // Generate insights
        const insights = [];
        if (totalEmotions === 0) {
            insights.push("Bạn chưa có dữ liệu cảm xúc trong khoảng thời gian này. Hãy bắt đầu ghi lại cảm xúc của bạn!");
        } else {
            if (negativeCount > positiveCount * 1.5) {
                insights.push(`Tuần này bạn có nhiều ngày căng thẳng hơn bình thường (${negativeCount} cảm xúc tiêu cực). Hãy thử các kỹ thuật thư giãn như thiền hoặc hít thở sâu.`);
            } else if (positiveCount > negativeCount * 1.5) {
                insights.push(`Bạn đang có một tuần tích cực! (${positiveCount} cảm xúc tích cực). Hãy tiếp tục duy trì tinh thần tốt này.`);
            }

            if (averageMood < 2.5) {
                insights.push("Mood rating trung bình của bạn khá thấp. Hãy cân nhắc thử các hoạt động nâng cao tinh thần như thể dục, gặp gỡ bạn bè, hoặc đọc sách.");
            } else if (averageMood > 3.5) {
                insights.push("Mood rating trung bình của bạn khá tốt! Hãy tiếp tục duy trì những hoạt động tích cực.");
            }

            // Find most common emotion
            const mostCommon = emotionStats.length > 0 
                ? emotionStats.reduce((max, stat) => stat.count > max.count ? stat : max, emotionStats[0])
                : null;
            
            if (mostCommon && mostCommon.count > 0) {
                insights.push(`Cảm xúc "${mostCommon.emotion}" xuất hiện nhiều nhất (${mostCommon.count} lần) trong khoảng thời gian này.`);
            }
        }

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                period,
                statistics: {
                    totalEmotions,
                    averageMood,
                    positiveCount,
                    negativeCount,
                    neutralCount,
                    positivePercentage: totalEmotions > 0 
                        ? Math.round((positiveCount / totalEmotions) * 100) 
                        : 0,
                    negativePercentage: totalEmotions > 0 
                        ? Math.round((negativeCount / totalEmotions) * 100) 
                        : 0,
                },
                emotionStats,
                dailyMoodData: dailyMoodArray,
                insights,
            },
            msg: "GET_TRENDS_SUCCESS",
        });

    } catch (error) {
        console.error("Get trends error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

export { getTrends };

