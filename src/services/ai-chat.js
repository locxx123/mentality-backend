// Simple sentiment analysis and response generation
// In production, you would use a proper AI service like OpenAI, etc.

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

const generateResponse = (message, sentiment) => {
    const responses = {
        positive: [
            "Tuyệt vời! Tôi rất vui khi nghe bạn cảm thấy tốt. Hãy tiếp tục duy trì tinh thần tích cực này nhé!",
            "Thật tuyệt! Bạn đang có một ngày tốt đẹp. Hãy tận hưởng khoảnh khắc này.",
            "Tôi rất vui khi biết bạn đang cảm thấy tốt. Hãy ghi nhớ cảm giác này và chia sẻ với những người thân yêu.",
        ],
        negative: [
            "Tôi hiểu bạn đang cảm thấy khó khăn. Hãy nhớ rằng bạn không đơn độc. Hãy thử hít thở sâu vài lần, hoặc viết ra những gì bạn đang cảm thấy.",
            "Cảm xúc tiêu cực là điều bình thường. Hãy dành thời gian cho bản thân, có thể là nghe nhạc nhẹ, đi dạo, hoặc thiền định.",
            "Tôi ở đây để lắng nghe bạn. Hãy thử một số kỹ thuật thư giãn như hít thở sâu 4-7-8 hoặc viết nhật ký cảm xúc.",
        ],
        neutral: [
            "Cảm ơn bạn đã chia sẻ. Hãy tiếp tục theo dõi cảm xúc của mình và đừng ngại chia sẻ khi cần.",
            "Tôi hiểu. Đôi khi cảm xúc của chúng ta ở trạng thái trung tính. Hãy chú ý đến những dấu hiệu của cơ thể và tâm trí.",
            "Hãy dành thời gian để suy ngẫm về cảm xúc của bạn. Viết nhật ký có thể giúp bạn hiểu rõ hơn về bản thân.",
        ],
    };
    
    const sentimentResponses = responses[sentiment] || responses.neutral;
    const randomResponse = sentimentResponses[Math.floor(Math.random() * sentimentResponses.length)];
    
    // Add suggestions based on sentiment
    let suggestions = "";
    if (sentiment === 'negative') {
        suggestions = " Tôi gợi ý bạn thử: thiền định 10 phút, nghe nhạc nhẹ, hoặc đọc một bài viết về chăm sóc sức khỏe tinh thần.";
    } else if (sentiment === 'positive') {
        suggestions = " Hãy tiếp tục duy trì thói quen tốt và chia sẻ niềm vui với người thân!";
    }
    
    return randomResponse + suggestions;
};

module.exports = {
    analyzeSentiment,
    generateResponse,
};

