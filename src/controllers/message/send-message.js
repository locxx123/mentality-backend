const { baseResponse } = require("@src/config/response");
const { getReceiverSocketId, io } = require("@src/lib/socket");
const Message = require("@src/models/Message");
const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl;
        // if (image) {
        //     // Upload base64 image to cloudinary
        //     const uploadResponse = await cloudinary.uploader.upload(image);
        //     imageUrl = uploadResponse.secure_url;
        //     console.log("Image uploaded to Cloudinary: ", imageUrl);
        // }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });


        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            console.log("Emitting newMessage to socketId: ", receiverSocketId);
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            msg: "MESSAGE_SENT",
            data: newMessage,
        });
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
module.exports = {
    sendMessage
};