import Emotion from "../../models/Emotion.js";
import { baseResponse } from "../../config/response.js";

const OPENAI_CHAT_URL = process.env.OPENAI_CHAT_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
const DEFAULT_GREETING = "Hôm nay là một ngày tốt để chăm sóc sức khỏe tâm lý của bạn.";

const buildWeeklySummary = (entries = []) =>
    entries.map(entry => ({
        date: entry.date,
        emotionType: entry.emotionType,
        moodRating: entry.moodRating,
        journalEntry: entry.journalEntry || "",
    }));

const generateAiGreeting = async (entries = []) => {
    try {
        if (!entries.length) return DEFAULT_GREETING;

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("generateAiGreeting skipped: OPENAI_API_KEY missing");
            return DEFAULT_GREETING;
        }

        const payload = buildWeeklySummary(entries);
        const systemPrompt = "Bạn là chuyên gia tâm lý MindScape, giao tiếp ấm áp và khích lệ người dùng chia sẻ thêm cảm xúc.";
        const userPrompt = `
Dữ liệu cảm xúc 7 ngày gần nhất (JSON):
${JSON.stringify(payload)}

Hãy viết 1 câu hỏi/ngỏ lời (tối đa 25 từ) bằng tiếng Việt nhắc lại cảm xúc nổi bật và mời người dùng chia sẻ thêm.
Ví dụ: "Bạn còn cảm thấy ... không? Hãy kể thêm cho mình nhé."
Chỉ trả về câu chữ, không giải thích.
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
                max_tokens: 120,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("generateAiGreeting failed:", errorText);
            return DEFAULT_GREETING;
        }

        const data = await response.json();
        const message = data?.choices?.[0]?.message?.content?.trim();
        return message?.length ? message : DEFAULT_GREETING;
    } catch (error) {
        console.error("generateAiGreeting error:", error);
        return DEFAULT_GREETING;
    }
};

const getDashboardGreeting = async (req, res) => {
    try {
        const userId = req.user._id;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);

        const weeklyEmotions = await Emotion.find({
            userId,
            date: { $gte: weekAgo },
        })
            .sort({ date: -1 })
            .limit(30)
            .lean();

        const greetingMessage = await generateAiGreeting(weeklyEmotions);

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: { greetingMessage },
            msg: "GET_DASHBOARD_GREETING_SUCCESS",
        });
    } catch (error) {
        console.error("Get dashboard greeting error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

export { getDashboardGreeting };