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
        });

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            msg: "MESSAGES_RETRIEVED",
            data: messages,
        });
    } catch (error) {
        console.log("Error in getMessages controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    getMessages
};