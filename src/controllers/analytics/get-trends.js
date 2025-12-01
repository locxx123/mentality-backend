import Emotion from "../../models/Emotion.js";
import { baseResponse } from "../../config/response.js";

const OPENAI_CHAT_URL = process.env.OPENAI_CHAT_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

const parseJsonArray = (text) => {
    if (!text) return null;
    try {
        const jsonStart = text.indexOf("[");
        const jsonEnd = text.lastIndexOf("]");
        if (jsonStart === -1 || jsonEnd === -1) return null;
        const jsonString = text.slice(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed) ? parsed : null;
    } catch (err) {
        console.error("parseJsonArray error:", err);
        return null;
    }
};

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

const buildTrendsData = async (userId, period = 'week') => {
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

    const emotionCounts = {};
    const moodRatings = [];
    currentEmotions.forEach(emotion => {
        emotionCounts[emotion.emotionType] = (emotionCounts[emotion.emotionType] || 0) + 1;
        moodRatings.push(emotion.moodRating);
    });

    const previousEmotionCounts = {};
    previousEmotions.forEach(emotion => {
        previousEmotionCounts[emotion.emotionType] = (previousEmotionCounts[emotion.emotionType] || 0) + 1;
    });

    const totalEmotions = currentEmotions.length;
    const averageMood = moodRatings.length > 0
        ? parseFloat((moodRatings.reduce((a, b) => a + b, 0) / moodRatings.length).toFixed(2))
        : 0;

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
    }).filter(stat => stat.count > 0);

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

    const dailyMoodArray = dayNames.map(dayName =>
        dailyMoodData[dayName] || { date: dayName, positive: 0, neutral: 0, negative: 0 }
    );

    const statistics = {
        totalEmotions,
        averageMood,
        positiveCount,
        negativeCount,
        neutralCount,
        positivePercentage: totalEmotions > 0 ? Math.round((positiveCount / totalEmotions) * 100) : 0,
        negativePercentage: totalEmotions > 0 ? Math.round((negativeCount / totalEmotions) * 100) : 0,
    };

    return {
        period,
        statistics,
        emotionStats,
        dailyMoodData: dailyMoodArray,
        totals: {
            totalEmotions,
            averageMood,
            positiveCount,
            negativeCount,
            neutralCount,
        },
    };
};

const generateAiInsights = async (summary) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("generateAiInsights skipped: OPENAI_API_KEY missing");
            return [];
        }

        const payload = {
            period: summary.period,
            statistics: summary.statistics,
            topEmotions: summary.emotionStats.slice(0, 4),
            dailyMoodData: summary.dailyMoodData,
        };

        const systemPrompt = "Bạn là chuyên gia tâm lý MindScape. Hãy dùng dữ liệu cảm xúc để đưa ra nhận xét súc tích.";
        const userPrompt = `
Dữ liệu cảm xúc JSON:
${JSON.stringify(payload)}

Hãy tạo duy nhất 1 đoạn nhận xét tiếng Việt khoảng 50 từ (tối đa 60, tối thiểu 40), dùng giọng điệu đồng cảm, đề cập xu hướng nổi bật theo khoảng thời gian ${summary.period}. Kết thúc bằng gợi ý hành động ngắn.
`.trim();

        const response = await fetch(OPENAI_CHAT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: OPENAI_CHAT_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                max_tokens: 180,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("generateAiInsights failed:", errorText);
            return [];
        }

        const data = await response.json();
        const insightText = data?.choices?.[0]?.message?.content?.trim();
        if (!insightText) return [];

        return [insightText];
    } catch (err) {
        console.error("generateAiInsights error:", err);
        return [];
    }
};

const generateAiRecommendations = async (summary) => {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("generateAiRecommendations skipped: OPENAI_API_KEY missing");
            return [];
        }

        const payload = {
            period: summary.period,
            statistics: summary.statistics,
            topEmotions: summary.emotionStats.slice(0, 4),
            dailyMoodData: summary.dailyMoodData,
        };

        const systemPrompt = "Bạn là chuyên gia sức khỏe tinh thần MindScape.";
        const userPrompt = `
Dữ liệu cảm xúc JSON:
${JSON.stringify(payload)}

Dựa vào dữ liệu trên, tạo tối đa 4 hoạt động gợi ý giúp người dùng cân bằng cảm xúc.
Trả về JSON array, mỗi phần tử có dạng:
{
  "title": "Tên hoạt động (tối đa 30 ký tự)",
  "description": "Mô tả khuyến nghị ngắn dưới 90 ký tự",
  "icon": "Emoji phù hợp"
}
Chỉ trả về JSON hợp lệ, không thêm giải thích.
`.trim();

        const response = await fetch(OPENAI_CHAT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: OPENAI_CHAT_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                max_tokens: 200,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("generateAiRecommendations failed:", errorText);
            return [];
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content?.trim();
        if (!content) return [];

        const parsed = parseJsonArray(content);
        if (!parsed) {
            console.error("generateAiRecommendations: unable to parse JSON", content);
            return [];
        }

        return parsed
            .filter(item => item?.title && item?.description && item?.icon)
            .slice(0, 4);
    } catch (err) {
        console.error("generateAiRecommendations error:", err);
        return [];
    }
};

const buildFallbackInsights = (summary) => {
    const { totalEmotions, positiveCount, negativeCount, averageMood } = summary.totals;
    if (totalEmotions === 0) {
        return ["Bạn chưa có dữ liệu cảm xúc trong khoảng thời gian này. Hãy bắt đầu ghi lại cảm xúc của bạn!"];
    }

    const fallback = [];
    if (negativeCount > positiveCount * 1.5) {
        fallback.push(`Bạn đang trải qua nhiều trạng thái căng thẳng (${negativeCount} cảm xúc tiêu cực). Hãy thử thiền hoặc vận động nhẹ.`);
    } else if (positiveCount > negativeCount * 1.5) {
        fallback.push(`Bạn có một giai đoạn tích cực (${positiveCount} cảm xúc tích cực). Tiếp tục duy trì thói quen đang giúp bạn.`);
    }

    if (averageMood < 2.5) {
        fallback.push("Mood rating trung bình khá thấp, hãy cân nhắc chia sẻ cảm xúc hoặc tìm hoạt động thư giãn.");
    } else if (averageMood > 3.5) {
        fallback.push("Mood rating trung bình đang tốt, hãy giữ nhịp sinh hoạt lành mạnh này.");
    }

    const mostCommon = summary.emotionStats.length > 0
        ? summary.emotionStats.reduce((max, stat) => stat.count > max.count ? stat : max, summary.emotionStats[0])
        : null;
    if (mostCommon && mostCommon.count > 0) {
        fallback.push(`Cảm xúc nổi bật: "${mostCommon.emotion}" với ${mostCommon.count} lần ghi lại.`);
    }

    return fallback.length ? fallback : ["Dữ liệu chưa đủ để tạo nhận xét chi tiết, hãy tiếp tục ghi lại cảm xúc nhé!"];
};

const buildFallbackRecommendations = (summary) => {
    if (summary.totals.totalEmotions === 0) {
        return [
            { title: "Bắt đầu ghi nhật ký", description: "Ghi lại cảm xúc hằng ngày để theo dõi tiến trình", icon: "📓" },
            { title: "Đi dạo ngắn", description: "Tản bộ nhẹ giúp làm mới tinh thần và quan sát cảm xúc", icon: "🚶" },
            { title: "Hít thở sâu", description: "Thực hành 5 phút hít thở để thư giãn cơ thể", icon: "🧘" },
            { title: "Kết nối bạn bè", description: "Trò chuyện với người thân về cảm nhận hiện tại", icon: "👥" },
        ];
    }

    return [
        { title: "Thiền chánh niệm", description: "Ngồi yên 10 phút quan sát hơi thở để cân bằng tâm trí", icon: "🧘" },
        { title: "Viết cảm nhận", description: "Ghi ra điều khiến bạn vui hoặc băn khoăn trong ngày", icon: "✍️" },
        { title: "Vận động nhẹ", description: "Đi bộ hoặc giãn cơ 15 phút để giải phóng năng lượng", icon: "🏃" },
        { title: "Kết nối tích cực", description: "Chia sẻ câu chuyện với người khiến bạn thấy an tâm", icon: "🤝" },
    ];
};

const getTrends = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = 'week' } = req.query;

        const data = await buildTrendsData(userId, period);

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                period: data.period,
                statistics: data.statistics,
                emotionStats: data.emotionStats,
                dailyMoodData: data.dailyMoodData,
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

const getTrendsInsights = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = 'week' } = req.query;

        const data = await buildTrendsData(userId, period);

        let insights = [];
        if (data.totals.totalEmotions === 0) {
            insights = buildFallbackInsights(data);
        } else {
            insights = await generateAiInsights(data);
            if (!insights.length) {
                insights = buildFallbackInsights(data);
            }
        }

        let recommendations = [];
        if (data.totals.totalEmotions === 0) {
            recommendations = buildFallbackRecommendations(data);
        } else {
            recommendations = await generateAiRecommendations(data);
            if (!recommendations.length) {
                recommendations = buildFallbackRecommendations(data);
            }
        }

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                period: data.period,
                insights,
                recommendations,
            },
            msg: "GET_TRENDS_AI_SUCCESS",
        });
    } catch (error) {
        console.error("Get trends insights error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

export { getTrends, getTrendsInsights };

