import { GoogleGenerativeAI } from "@google/generative-ai";

// Simple sentiment analysis and response generation
const analyzeSentiment = (message) => {
    const lowerMessage = message.toLowerCase();

    // Simple keyword-based sentiment analysis
    const positiveWords = ['happy', 'good', 'great', 'excited', 'joy', 'love', 'grateful', 'thankful', 'wonderful', 'amazing', 'fantastic'];
    const negativeWords = ['sad', 'bad', 'angry', 'anxious', 'stressed', 'worried', 'depressed', 'lonely', 'tired', 'frustrated', 'upset'];

    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
        if (lowerMessage.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
        if (lowerMessage.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) {
        return { sentiment: 'positive', score: 0.5 + (positiveCount * 0.1) };
    } else if (negativeCount > positiveCount) {
        return { sentiment: 'negative', score: -0.5 - (negativeCount * 0.1) };
    } else {
        return { sentiment: 'neutral', score: 0 };
    }
};

// Generate response với Gemini API và context
const generateResponseWithContext = async (message, context, sentiment) => {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // model ưu tiên
    const modelsToTry = ["gemini-2.5-pro"];

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });

            const prompt = `
Bạn là chuyên gia tư vấn tâm lý của nền tảng MindScape.
Dưới đây là các cảm xúc gần đây của người dùng:
${context || "Người dùng chưa có lịch sử cảm xúc gần đây."}

Người dùng vừa nói: "${message}"

Hãy phản hồi với sự đồng cảm, dựa trên cảm xúc gần đây của họ,
và đưa ra gợi ý giúp họ cân bằng tinh thần. Phản hồi bằng tiếng Việt, ngắn gọn và ấm áp.
`;

            // Cách gọi mới
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            });

            const reply = result.response.text();
            console.log(`✅ Successfully used model: ${modelName}`);
            return reply;
        } catch (error) {
            console.error(`❌ Model ${modelName} failed:`, error.message);
        }
    }

    // fallback nếu tất cả model fail
    const fallback = {
        positive: "Thật tuyệt khi bạn đang có tâm trạng tốt. Hãy duy trì điều này nhé!",
        neutral: "Cảm ơn bạn đã chia sẻ. Hãy lắng nghe cảm xúc của mình mỗi ngày.",
        negative:
            "Tôi hiểu điều đó có thể khiến bạn buồn. Hãy cho phép bản thân nghỉ ngơi và hồi phục nhé.",
    };

    return fallback[sentiment] || fallback.neutral;
};

// Giữ lại hàm cũ để backward compatibility (nếu có nơi nào khác dùng)
const generateResponse = (message, sentiment) => {
    const responses = {
        positive: [
            "Tuyệt vời! Tôi rất vui khi nghe bạn cảm thấy tốt. Hãy tiếp tục duy trì tinh thần tích cực này nhé!",
        ],
        negative: [
            "Tôi hiểu bạn đang cảm thấy khó khăn. Hãy nhớ rằng bạn không đơn độc.",
        ],
        neutral: [
            "Cảm ơn bạn đã chia sẻ. Hãy tiếp tục theo dõi cảm xúc của mình.",
        ],
    };

    const sentimentResponses = responses[sentiment] || responses.neutral;
    return sentimentResponses[0];
};

export {
    analyzeSentiment,
    generateResponse,
    generateResponseWithContext,
};

