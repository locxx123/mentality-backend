const { generateOtp } = require("@utils/generateOtp");
const { sendOtpEmail } = require("@services/otp");
const Otp = require("@src/models/Otp");
const { baseResponse } = require("@src/config/response");


// Lấy thời gian expires từ env
const OTP_EXPIRES_MS = parseInt(process.env.OTP_EXPIRES_MS) || 120000; // 2 phút

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;


        // Kiểm tra đã có OTP chưa hết hạn cho số điện thoại này chưa
        const existingOtp = await Otp.findOne({
            email: email,
            is_used: false,
            expires_at: { $gt: new Date() },
        });
        console.log(existingOtp)

        if (existingOtp) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "Đã có mã OTP chưa hết hạn. Vui lòng đợi hoặc yêu cầu mã mới sau khi hết hạn",
            });
        }

        // Xóa các OTP cũ đã hết hạn hoặc đã sử dụng của số điện thoại này
        await Otp.deleteMany({
            email: email,
            $or: [{ is_used: true }, { expires_at: { $lte: new Date() } }],
        });

        // Gen OTP
        const otp = generateOtp(6);

        // Gửi email
        const otpCode = await sendOtpEmail(email, otp);

        // Lưu OTP mới vào database
        const newOtp = new Otp({
            email: email,
            otp: otpCode,
            expires_at: new Date(Date.now() + OTP_EXPIRES_MS),
        });

        await newOtp.save();

        console.log(`Send otp for ${email}: ${otpCode}`); // Chỉ log để debug

        return res.json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.error("sendOtp error:", error);
        return res.status(500).json({ success: false, message: "Failed to send OTP" });
    }
}

module.exports = { sendOtp };
