import { GoogleGenAI } from "@google/genai";
import Emotion from "../../models/Emotion.js";
import { baseResponse } from "../../config/response.js";
import createEmbedding from "../../utils/embed.js";

const DEFAULT_TOP_K = 5;
const PSYCHO_KEYWORDS = ["mệt", "buồn", "chán nản", "stress", "lo lắng", "tức giận", "căng thẳng"];

const cosineSimilarity = (vecA = [], vecB = []) => {
    const length = Math.min(vecA.length, vecB.length);
    if (length === 0) return 0;
    let dot = 0.0, normA = 0.0, normB = 0.0;
    for (let i = 0; i < length; i++) {
        const a = vecA[i] || 0;
        const b = vecB[i] || 0;
        dot += a * b;
        normA += a * a;
        normB += b * b;
    }
    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dot / denominator;
};

const buildContext = (entries) => {
    if (!entries.length) return "";
    return entries
        .map(
            (entry, idx) =>
                `${idx + 1}. Mood: ${entry.emotionType}, Journal: "${entry.journalEntry || "Không có mô tả"}"`
        )
        .join("\n");
};

const extractAnswerText = (response) => {
    const candidate = response?.candidates?.[0];
    if (!candidate) return "";
    if (Array.isArray(candidate.content?.parts)) {
        return candidate.content.parts.map(p => p.text || "").join("").trim();
    }
    if (Array.isArray(candidate.content)) {
        return candidate.content.map(p => p.text || "").join("").trim();
    }
    return "";
};

const askQuestion = async (req, res) => {
    try {
        const { question } = req.body || {};
        const userId = req.user?._id;

        if (!question || !question.trim()) {
            return baseResponse(res, { success: false, statusCode: 400, msg: "QUESTION_REQUIRED" });
        }

        // Kiểm tra xem câu hỏi có liên quan tâm lý không
        const lowerQuestion = question.toLowerCase();
        const isPsychological = PSYCHO_KEYWORDS.some(word => lowerQuestion.includes(word));

        // Tạo embedding cho câu hỏi
        const questionEmbedding = await createEmbedding(question);
        const questionVector = Array.isArray(questionEmbedding?.values)
            ? questionEmbedding.values
            : questionEmbedding;

        if (!questionVector?.length) {
            return baseResponse(res, { success: false, statusCode: 500, msg: "EMBEDDING_FAILED" });
        }

        const userEntries = await Emotion.find({ userId });

        // Chỉ lấy top-k khi câu hỏi liên quan tâm lý
        const limit = isPsychological ? DEFAULT_TOP_K : 0;

        const entriesWithScore = userEntries
            .filter(e => Array.isArray(e.vector) && e.vector.length > 0)
            .map(entry => ({
                entry,
                score: cosineSimilarity(questionVector, entry.vector)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        const topEntries = entriesWithScore.map(({ entry, score }) => ({
            id: entry._id,
            emotionType: entry.emotionType,
            journalEntry: entry.journalEntry,
            moodRating: entry.moodRating,
            score
        }));

        const contextText = buildContext(topEntries);

        // Xây prompt linh hoạt
        let prompt = "";
        let maxTokens = 150;
        if (isPsychological) {
            prompt = `
Bạn là AI tư vấn tâm lý. Dữ liệu tham khảo từ nhật ký user:
${contextText}

Người dùng hôm nay hỏi: "${question}"

Hãy đưa ra lời khuyên tâm lý, gợi ý kỹ thuật thư giãn, với giọng đồng cảm. Trả lời bằng tiếng Việt.
`.trim();
            maxTokens = 300; // dài hơn cho tư vấn tâm lý
        } else {
            prompt = `Trả lời ngắn gọn, đúng trọng tâm câu hỏi: "${question}". Không thêm lời khuyên tâm lý.`;
            maxTokens = 100; // ngắn hơn
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return baseResponse(res, { success: false, statusCode: 500, msg: "GEMINI_API_KEY_NOT_FOUND" });
        }

        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            maxOutputTokens: maxTokens,
            temperature: 0.6
        });

        const answer = response.text || extractAnswerText(response) || "";

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: { answer, suggestions: topEntries },
            msg: "ASK_SUCCESS"
        });

    } catch (error) {
        console.error("Ask question error:", error);
        return baseResponse(res, { success: false, statusCode: 500, msg: "SERVER_ERROR" });
    }
};

export { askQuestion };
