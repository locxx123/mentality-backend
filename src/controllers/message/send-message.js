const { baseResponse } = require("@src/config/response");
const { getReceiverSocketId, io } = require("@src/lib/socket");
const Message = require("@src/models/Message");
const cloudinary = require("@src/lib/cloudinary").default;

const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        // Upload ảnh base64 (data URL) lên Cloudinary nếu client gửi kèm "image"
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image, {
                folder: "chat",
                resource_type: "image",
            });
            imageUrl = uploadResponse.secure_url;
        }
        console.log("Image uploaded to Cloudinary:", imageUrl);

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        // Định dạng lại dữ liệu trả về
        const formattedMessage = {
            id: newMessage._id,  // đổi từ _id → id
            senderId: newMessage.senderId,
            receiverId: newMessage.receiverId,
            text: newMessage.text,
            image: newMessage.image,
            createdAt: newMessage.createdAt,
            updatedAt: newMessage.updatedAt,
        };

        // Gửi tin nhắn qua socket nếu người nhận đang online
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            console.log("Emitting newMessage to socketId:", receiverSocketId);
            io.to(receiverSocketId).emit("newMessage", formattedMessage);
        }

        // Trả response về client
        return baseResponse(res, {
            success: true,
            statusCode: 200,
            msg: "MESSAGE_SENT",
            data: formattedMessage,
        });
    } catch (error) {
        console.log("Error in sendMessage controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    sendMessage,
};
