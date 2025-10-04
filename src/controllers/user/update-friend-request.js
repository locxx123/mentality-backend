const FriendRequest = require("@models/FriendRequest");
const User = require("@models/User");
const { baseResponse } = require("@src/config/response");
const { getReceiverSocketId, io } = require("@src/lib/socket");

const updateFriendRequest = async (req, res) => {
    try {
        const currentUser = req.user;
        const { requestId, action } = req.body;

        // Tìm lời mời kết bạn
        const friendRequest = await FriendRequest.findOne({
            _id: requestId,
            receiver: currentUser._id,
            status: "pending"
        });

        if (!friendRequest) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: "FRIEND_REQUEST_NOT_FOUND",
            });
        }

        if (action === "accepted") {
            friendRequest.status = "accepted";
            friendRequest.acceptedAt = new Date();
        } else if (action === "decline") {
            friendRequest.status = "declined";
        } else {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "INVALID_ACTION",
            });
        }

        await friendRequest.save();

        // Khi chấp nhận lời mời kết bạn, gửi thông tin người chấp nhận về cho người gửi
        if (action === "accepted") {
            const acceptedUser = await User.findById(currentUser._id).select("fullName phone avatar");
            const senderSocketId = getReceiverSocketId(friendRequest.sender);
            if (senderSocketId) {
                io.to(senderSocketId).emit("friend:request:accepted",
                    {
                        id: acceptedUser._id,
                        fullName: acceptedUser.fullName,
                        phone: acceptedUser.phone,
                        avatar: acceptedUser.avatar
                    },
                );
            }
        }

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            msg: "FRIEND_REQUEST_UPDATED",
            data: friendRequest,
        });
    } catch (error) {
        console.error("Update friend request error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = { updateFriendRequest };