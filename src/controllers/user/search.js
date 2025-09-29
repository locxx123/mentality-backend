const User = require("@models/User");
const { baseResponse } = require("@src/config/response");

const search = async (req, res) => {
    try {
        const currentUser = req.user; // user đang đăng nhập
        const { phone } = req.query;

        // Tìm user theo phone
        const foundUser = await User.findByPhone(phone)

        let result;
        let msg;

        if (!foundUser) {
            // Trường hợp 3: chưa đăng ký
            result = {
                phone: phone,
            }
            msg = "NOT_REGISTERED"
        } else {
            // Đã đăng ký
            const isFriend = currentUser.friends?.some(
                (friendId) => friendId.toString() === foundUser._id.toString()
            );

            if (isFriend) {
                // Trường hợp 1: đã đăng ký & đã kết bạn
                msg = "REGISTERED_AND_FRIEND"
            } else {
                // Trường hợp 2: đã đăng ký & chưa kết bạn
                msg = "REGISTERED_NOT_FRIEND"
            }
            result = {
                user: {
                    id: foundUser._id,
                    fullName: foundUser.fullName,
                    phone: foundUser.phone,
                    avatar: foundUser.avatar,
                },
            }
        }

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            msg: msg,
            data: result,
        });
    } catch (error) {
        console.error("Search error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: "SERVER_ERROR",
        });
    }
};

module.exports = {
    search,
};
