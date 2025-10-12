const { baseResponse } = require("@src/config/response");
const Message = require("@src/models/Message");

const getMessages = async (req, res) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        })
            .sort({ createdAt: 1 }) // tuỳ bạn có muốn sort theo thời gian gửi
            .lean();

        // ✨ Quy đổi _id → id + ép kiểu ObjectId thành string
        const formattedMessages = messages.map((msg) => ({
            id: msg._id.toString(),
            senderId: msg.senderId.toString(),
            receiverId: msg.receiverId.toString(),
            text: msg.text,
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt,
            // nếu có thêm field khác (như type, attachments, v.v.), spread cho đầy đủ:
            ...Object.fromEntries(
                Object.entries(msg).filter(
                    ([key]) => !["_id", "senderId", "receiverId", "__v"].includes(key)
                )
            ),
        }));

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            msg: "MESSAGES_RETRIEVED",
            data: formattedMessages,
        });
    } catch (error) {
        console.log("Error in getMessages controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getMessages,
};
