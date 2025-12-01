import { generateOtp } from "../../utils/generateOtp.js";
import { sendOtpEmail } from "../../services/otp.js";
import Otp from "../../models/Otp.js";
import { baseResponse } from "../../config/response.js";
import User from "../../models/User.js";

const OTP_EXPIRES_MS = parseInt(process.env.OTP_EXPIRES_MS) || 120000; // 2 phút

const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        // Parallel check email & existing OTP
        const [existingUser, existingOtp] = await Promise.all([
            User.findOne({ email }),
            Otp.findOne({ email, is_used: false, expires_at: { $gt: new Date() } })
        ]);

        if (existingUser) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "Email đã tồn tại",
            });
        }

        if (existingOtp) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "Vui lòng chờ trước khi yêu cầu OTP mới",
            });
        }

        // Xóa OTP cũ bất đồng bộ (không block response)
        Otp.deleteMany({
            email,
            $or: [{ is_used: true }, { expires_at: { $lte: new Date() } }]
        }).catch(err => console.error("Delete old OTP error:", err));

        // Gen OTP
        const otp = generateOtp(6);

        // Lưu OTP mới vào database
        const newOtp = new Otp({
            email,
            otp,
            expires_at: new Date(Date.now() + OTP_EXPIRES_MS),
        });
        await newOtp.save();

        // Trả response ngay lập tức
        baseResponse(res, {
            success: true,
            statusCode: 201,
            msg: "OTP được gửi thành công",
        });

        console.log(`Send otp for ${email}: ${otp}`);

        // Gửi email bất đồng bộ
        sendOtpEmail(email, otp).catch(err => {
            console.error(`Failed to send OTP email to ${email}`, err);
        });

    } catch (error) {
        console.error("sendOtp error:", error);
        return baseResponse(res, { 
            success: false, 
            statusCode: 400,
            msg: "Gửi OTP thất bại" 
        });
    }
};

export { sendOtp };
