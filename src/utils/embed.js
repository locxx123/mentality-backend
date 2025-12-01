const OPENAI_EMBED_URL = process.env.OPENAI_EMBED_URL || "https://api.openai.com/v1/embeddings";
const DEFAULT_EMBED_MODEL = process.env.OPENAI_EMBED_MODEL || "text-embedding-3-small";

/**
 * Hàm tạo embedding vector từ text
 * @param {string} text - Text cần nhúng thành vector
 * @returns {Promise<number[]>} - Mảng các số biểu diễn vector embedding
 */
async function createEmbedding(text) {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("❌ Lỗi: Biến môi trường OPENAI_API_KEY chưa được thiết lập!");
        return [];
    }

    try {
        const response = await fetch(OPENAI_EMBED_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: DEFAULT_EMBED_MODEL,
                input: text.trim(),
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ Lỗi khi gọi OpenAI Embedding API:", errorText);
            return [];
        }

        const data = await response.json();
        const embedding = data?.data?.[0]?.embedding;

        if (Array.isArray(embedding)) {
            return embedding;
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