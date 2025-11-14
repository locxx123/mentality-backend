import { GoogleGenAI } from "@google/genai";

/**
 * Hàm tạo embedding vector từ text
 * @param {string} text - Text cần nhúng thành vector
 * @returns {Promise<number[]>} - Mảng các số biểu diễn vector embedding
 */
async function createEmbedding(text) {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("❌ Lỗi: Biến môi trường GEMINI_API_KEY chưa được thiết lập!");
        return [];
    }

    try {
        // Khởi tạo GoogleGenAI
        const ai = new GoogleGenAI({ apiKey }); 
        // Mô hình nhúng được khuyến nghị
        const modelName = 'text-embedding-004'; 
        
        // Thực hiện embedding
        const response = await ai.models.embedContent({
            model: modelName,
            contents: [text.trim()],
        });
        
        const embedding = response.embeddings[0]; 
        
        if (embedding && embedding.values) {
            return embedding.values;
        }
        
        return [];
        
    } catch (error) {
        console.error("❌ Lỗi khi nhúng:", error.message);
        return [];
    }
}

const geminiEmbed = createEmbedding;

export { createEmbedding, geminiEmbed };
export default createEmbedding;