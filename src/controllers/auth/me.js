const { baseResponse } = require("@src/config/response");
const User = require("@src/models/User");

const getProfile = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        console.log("User ID from token:", userId);

        const user = await User.findById(userId);
        if (!user) {
            return baseResponse(res, {
                success: false,
                statusCode: 404,
                msg: 'Người dùng không tồn tại'
            });
        }

        const {id, createdAt, updatedAt,isVerified, ...userData} = user.toJSON();

        return baseResponse(res, {
            success: true,
            statusCode: 200,
            data: {
                user: userData,
            },
            msg: 'Lấy thông tin người dùng thành công'
        });
    } catch (error) {
        console.error('Lỗi lấy thông tin người dùng:', error);
        return baseResponse(res, {
            success: false,
            statusCode: 500,
            msg: 'Lỗi máy chủ, vui lòng thử lại sau'
        });
    }
}
module.exports = { getProfile };