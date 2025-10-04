const User = require("@models/User");
const FriendRequest = require("@models/FriendRequest");
const { baseResponse } = require("@src/config/response");
const { getReceiverSocketId, io } = require("@src/lib/socket");

const addFriend = async (req, res) => {
    try {
        const currentUser = req.user;
        const { phone } = req.body;

        // Tìm user theo phone
        const friendUser = await User.findByPhone(phone);

        if (!friendUser) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: "USER_NOT_FOUND",
            });
        }

        // Không cho gửi lời mời tới chính mình
        if (friendUser._id.toString() === currentUser._id.toString()) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "CANNOT_ADD_SELF",
            });
        }

        // Kiểm tra đã có lời mời kết bạn chưa (cả 2 chiều)
        const existed = await FriendRequest.findOne({
            $or: [
                { sender: currentUser._id, receiver: friendUser._id },
                { sender: friendUser._id, receiver: currentUser._id }
            ],
            status: { $in: ["pending", "accepted"] }
        });

        if (existed) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "ALREADY_INVITED_OR_FRIEND",
            });
        }

        // Tạo lời mời kết bạn mới
        const newRequest = await FriendRequest.create({
            sender: currentUser._id,
            receiver: friendUser._id,
            status: "pending",
            invitedAt: new Date()
        });

        // Lấy thông tin chi tiết 
        const populatedRequest = await FriendRequest.findById(newRequest._id)
            .populate("sender", "fullName phone avatar");

        // Bắn về socket cho người nhận
        const receiverSocketId = getReceiverSocketId(friendUser._id);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("friend:request:new", populatedRequest);
        }

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            msg: "INVITE_SENT",
        });
    } catch (error) {
        console.error("Add friend error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { addFriend };