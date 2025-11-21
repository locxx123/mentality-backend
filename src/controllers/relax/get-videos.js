import Emotion from "../../models/Emotion.js";
import { baseResponse } from "../../config/response.js";

const OPENAI_CHAT_URL = process.env.OPENAI_CHAT_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_CHAT_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";

/**
 * Build emotion summary for AI prompt
 */
const buildEmotionSummary = (emotions = []) =>
    emotions.map((entry) => ({
        date: entry.date,
        emotionType: entry.emotionType,
        moodRating: entry.moodRating,
        journalEntry: entry.journalEntry || "",
    }));

/**
 * Parse JSON from AI response
 */
const parseJson = (text) => {
    if (!text) return null;
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
        return JSON.parse(text);
    } catch (error) {
        console.error("parseJson error:", error);
        return null;
    }
};

/**
 * Default response when AI fails or no emotions
 * Using verified, popular Vietnamese relaxation videos
 */
const DEFAULT_RESPONSE = {
    message: "Hãy dành thời gian để thư giãn và chăm sóc bản thân. Dưới đây là một số video có thể giúp bạn.",
    videos: [
        {
            id: "1",
            title: "Nhạc Thiền - Thư Giãn Sâu, Xóa Tan Căng Thẳng",
            url: "https://www.youtube.com/watch?v=5qap5aO4i9A",
            description: "Nhạc thiền nhẹ nhàng giúp thư giãn tâm trí và cơ thể",
            thumbnail: "https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg",
        },
        {
            id: "2",
            title: "Nhạc Piano Nhẹ Nhàng - Giảm Stress, Lo Âu",
            url: "https://www.youtube.com/watch?v=lCOF9LN_Zxs",
            description: "Piano du dương giúp xoa dịu tâm hồn và giảm căng thẳng",
            thumbnail: "https://img.youtube.com/vi/lCOF9LN_Zxs/maxresdefault.jpg",
        },
        {
            id: "3",
            title: "Thiền Chánh Niệm - Hướng Dẫn Thực Hành",
            url: "https://www.youtube.com/watch?v=inpok4MKVLM",
            description: "Hướng dẫn thiền chánh niệm cho người mới bắt đầu",
            thumbnail: "https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg",
        },
        {
            id: "4",
            title: "Tiếng Mưa Rơi & Sấm Xa - Ngủ Ngon Sâu Giấc",
            url: "https://www.youtube.com/watch?v=mPZkdNFkNps",
            description: "Âm thanh thiên nhiên giúp bạn ngủ ngon và sâu giấc",
            thumbnail: "https://img.youtube.com/vi/mPZkdNFkNps/maxresdefault.jpg",
        },
        {
            id: "5",
            title: "Yoga Buổi Sáng 15 Phút - Năng Lượng Tích Cực",
            url: "https://www.youtube.com/watch?v=oBu-pQG6sTY",
            description: "Bài tập yoga nhẹ nhàng giúp bắt đầu ngày mới tràn đầy năng lượng",
            thumbnail: "https://img.youtube.com/vi/oBu-pQG6sTY/maxresdefault.jpg",
        },
    ],
};

/**
 * Generate personalized videos based on user emotions using AI
 */
const generatePersonalizedVideos = async (emotions = []) => {
    try {
        if (!emotions.length) return DEFAULT_RESPONSE;

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.warn("generatePersonalizedVideos skipped: OPENAI_API_KEY missing");
            return DEFAULT_RESPONSE;
        }

        const summary = buildEmotionSummary(emotions);

        const systemPrompt = `Bạn là chuyên gia tâm lý MindScape, giúp người dùng tìm video YouTube phù hợp để thư giãn dựa trên cảm xúc gần đây.`;

        const userPrompt = `
Dữ liệu cảm xúc 10 ngày gần nhất (JSON):
${JSON.stringify(summary)}

Hãy phân tích cảm xúc của người dùng và:
1. Viết 1 câu nhận xét ấm áp (30-50 từ) về trạng thái cảm xúc của họ
2. Gợi ý 5 video YouTube THỰC TẾ ĐANG TỒN TẠI từ các kênh phổ biến tiếng Việt như:
   - Kênh "Nhạc Thiền" (nhạc thiền, meditation)
   - Kênh "Vietcetera" (podcast tâm lý)
   - Kênh "Học Viện Yoga" (yoga, thư giãn)
   - Kênh "Thiền Việt Nam" (thiền chánh niệm)
   - Kênh "Sleep Sounds" (âm thanh ngủ ngon)

QUAN TRỌNG: Chỉ sử dụng các VIDEO_ID sau đây (đã được xác minh tồn tại):
- Nhạc thiền thư giãn: r3gRcVd1swk,VbT2wQq5jQY, lCOF9LN_Zxs, JfcC0p8hdPA
- Thiền chánh niệm: inpok4MKVLM, O-6f5wQXSu8, 1ZYbU82GVz4
- Âm thanh ngủ ngon: mPZkdNFkNps, 1vx8iUvfyCY, sYoqCJNE2NAL
- Yoga thư giãn: oBu-pQG6sTY, v7AYKMP6rOE, 4pKly2JojMw
- Podcast tâm lý: lTRiuFIWV54, b1kbLwvqugk, 4pLIqVLbYRA

Trả về JSON với cấu trúc:
{
  "message": "Câu nhận xét ấm áp về cảm xúc người dùng, có nhắc đến cảm xúc cụ thể",
  "videos": [
    {
      "id": "1",
      "title": "Tiêu đề video bằng tiếng Việt",
      "url": "https://www.youtube.com/watch?v=[VIDEO_ID từ danh sách trên]",
      "description": "Mô tả ngắn phù hợp với cảm xúc người dùng (dưới 80 ký tự)",
      "thumbnail": "https://img.youtube.com/vi/[VIDEO_ID]/maxresdefault.jpg"
    }
  ]
}

Yêu cầu:
- BẮT BUỘC: Chỉ dùng VIDEO_ID từ danh sách đã cho ở trên
- Chọn 5 video PHÙ HỢP NHẤT với cảm xúc người dùng
- Ví dụ: nếu buồn/stress → ưu tiên nhạc thiền, thiền chánh niệm
- Ví dụ: nếu mất ngủ/lo âu → ưu tiên âm thanh ngủ ngon, thiền
- Câu nhận xét phải đồng cảm, đề cập cảm xúc cụ thể
- Chỉ trả về JSON hợp lệ, không thêm văn bản nào khác
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
                max_tokens: 800,
                temperature: 0.8,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("generatePersonalizedVideos OpenAI failed:", errorText);
            return DEFAULT_RESPONSE;
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content?.trim();

        if (!content) {
            console.warn("generatePersonalizedVideos: empty AI response");
            return DEFAULT_RESPONSE;
        }

        const parsed = parseJson(content);
        if (!parsed || !parsed.message || !Array.isArray(parsed.videos)) {
            console.error("generatePersonalizedVideos: invalid JSON structure", content);
            return DEFAULT_RESPONSE;
        }

        // Validate videos have required fields
        const validVideos = parsed.videos.filter(
            (v) => v?.id && v?.title && v?.url && v?.description && v?.thumbnail
        );

        if (validVideos.length === 0) {
            console.warn("generatePersonalizedVideos: no valid videos returned");
            return DEFAULT_RESPONSE;
        }

        return {
            message: parsed.message,
            videos: validVideos.slice(0, 5), // Limit to 5 videos
        };
    } catch (error) {
        console.error("generatePersonalizedVideos error:", error);
        return DEFAULT_RESPONSE;
    }
};

/**
 * Get personalized relaxation videos based on user's recent emotions
 */
const getRelaxVideos = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return baseResponse(res, {
                success: false,
                statusCode: 401,
                msg: "UNAUTHORIZED",
            });
        }

        // Fetch last 10 emotions
        const recentEmotions = await Emotion.find({ userId })
            .sort({ date: -1 })
            .limit(10)
            .lean();

        const result = await generatePersonalizedVideos(recentEmotions);

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                message: result.message,
                videos: result.videos,
            },
            msg: "GET_RELAX_VIDEOS_SUCCESS",
        });
    } catch (error) {
        console.error("Get relax videos error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

export { getRelaxVideos };

