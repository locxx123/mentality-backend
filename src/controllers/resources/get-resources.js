import Emotion from "../../models/Emotion.js";
import { baseResponse } from "../../config/response.js";
import DEFAULT_RESOURCES from "../../config/general.js";
const OPENAI_CHAT_URL = process.env.OPENAI_CHAT_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

const parseJson = (text) => {
    if (!text) return null;
    try {
        return JSON.parse(text);
    } catch (directParseError) {
        try {
            const jsonStart = text.indexOf("{");
            const jsonEnd = text.lastIndexOf("}");
            if (jsonStart === -1 || jsonEnd === -1) throw directParseError;
            const jsonString = text.slice(jsonStart, jsonEnd + 1);
            return JSON.parse(jsonString);
        } catch (error) {
            console.error("parseJson error:", error);
            return null;
        }
    }
};

const randomSubset = (items = [], count = 3) => {
    if (!Array.isArray(items) || !items.length) return [];
    const maxCount = Math.min(items.length, Math.max(1, count));
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, maxCount);
};

const sanitizeList = (items = [], fallback = []) => {
    if (!Array.isArray(items) || !items.length) return fallback;
    return items
        .filter(item => item && item.title && item.description)
        .map((item, index) => ({
            id: item.id || `item-${Date.now()}-${index}`,
            title: item.title,
            description: item.description,
            icon: item.icon || "💡",
            duration: item.duration,
            category: item.category,
            difficulty: item.difficulty,
        }));
};

const buildEmotionSummary = (emotions = []) => {
    const counts = emotions.reduce((acc, emotion) => {
        acc[emotion.emotionType] = (acc[emotion.emotionType] || 0) + 1;
        return acc;
    }, {});

    const samples = emotions.slice(0, 15).map(entry => ({
        date: entry.date,
        emotionType: entry.emotionType,
        moodRating: entry.moodRating,
        journalEntry: entry.journalEntry?.slice(0, 200) || "",
    }));

    return {
        totals: counts,
        sampleEntries: samples,
    };
};

const generateAiResources = async (emotions = []) => {
    try {
        if (!emotions.length) return null;
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("generateAiResources skipped: OPENAI_API_KEY missing");
            return null;
        }

        const summary = buildEmotionSummary(emotions);
        const systemPrompt = "Bạn là trợ lý MindScape, đề xuất tài nguyên hỗ trợ sức khỏe tinh thần dựa trên cảm xúc gần đây của người dùng. Luôn trả về JSON hợp lệ và không thêm lời giải thích.";
        const userPrompt = `
Phân tích cảm xúc 7 ngày gần nhất (JSON):
${JSON.stringify(summary)}

Hãy đề xuất các tài nguyên phù hợp và trả về JSON với cấu trúc:
{
  "articles": [{ "id": "...", "title": "...", "description": "...", "icon": "📖", "category": "..." }],
  "techniques": [{ "id": "...", "title": "...", "description": "...", "icon": "🧘", "duration": "10 phút", "difficulty": "easy|medium|hard" }],
  "resources": [{ "id": "...", "title": "...", "description": "...", "icon": "🎧", "category": "...", "duration": "tùy chọn" }]
}

Yêu cầu:
- Mỗi mục TỐI ĐA 3 gợi ý ngắn gọn bằng tiếng Việt, liên quan trực tiếp tới cảm xúc/journal đã cung cấp (ví dụ mất ngủ, lo âu, tức giận...).
- Icon phải là emoji.
- Trả về JSON hợp lệ duy nhất, không thêm bất kỳ văn bản nào khác.
`.trim();
console.log("userPrompt:", userPrompt);

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
                max_tokens: 350,
                temperature: 0.6,
                response_format: { type: "json_object" },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("generateAiResources failed:", errorText);
            return null;
        }

        const data = await response.json();
        return parseJson(data?.choices?.[0]?.message?.content);
    } catch (error) {
        console.error("generateAiResources error:", error);
        return null;
    }
};

const getResources = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return baseResponse(res, {
                success: false,
                statusCode: 401,
                msg: "UNAUTHORIZED",
            });
        }

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentEmotions = await Emotion.find({
            userId,
            date: { $gte: sevenDaysAgo },
        })
            .sort({ date: -1 })
            .limit(40)
            .lean();

        const aiRecommendations = await generateAiResources(recentEmotions);
        const fallbackPayload = {
            articles: randomSubset(DEFAULT_RESOURCES.articles, 4),
            techniques: randomSubset(DEFAULT_RESOURCES.techniques, 4),
            resources: randomSubset(DEFAULT_RESOURCES.resources, 4),
        };

        const articles = sanitizeList(aiRecommendations?.articles, fallbackPayload.articles);
        const techniques = sanitizeList(aiRecommendations?.techniques, fallbackPayload.techniques);
        const resources = sanitizeList(aiRecommendations?.resources, fallbackPayload.resources);

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                articles,
                techniques,
                resources,
            },
            msg: "GET_RESOURCES_SUCCESS",
        });

    } catch (error) {
        console.error("Get resources error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

export { getResources };

