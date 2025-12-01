import { generateOtp } from "../../utils/generateOtp.js";
import { sendOtpEmail } from "../../services/otp.js";
import Otp from "../../models/Otp.js";
import { baseResponse } from "../../config/response.js";
import User from "../../models/User.js";

const OTP_EXPIRES_MS = parseInt(process.env.OTP_EXPIRES_MS) || 120000;

const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "Email chưa được đăng ký",
            });
        }

        const existingOtp = await Otp.findOne({
            email,
            is_used: false,
            expires_at: { $gt: new Date() }
        });

        if (existingOtp) {
            return baseResponse(res, {
                success: false,
                statusCode: 400,
                msg: "Vui lòng chờ trước khi yêu cầu OTP mới",
            });
        }

        Otp.deleteMany({
            email,
            $or: [{ is_used: true }, { expires_at: { $lte: new Date() } }]
        }).catch(err => console.error("Delete old reset OTP error:", err));

        const otp = generateOtp(6);

        const newOtp = new Otp({
            email,
            otp,
            expires_at: new Date(Date.now() + OTP_EXPIRES_MS),
        });
        await newOtp.save();

        baseResponse(res, {
            success: true,
            statusCode: 200,
            msg: "Mã OTP đã được gửi đến email của bạn",
        });

        console.log(`Send reset otp for ${email}: ${otp}`);

        sendOtpEmail(email, otp).catch(err => {
            console.error(`Failed to send reset OTP email to ${email}`, err);
        });
    } catch (error) {
        console.error("sendResetOtp error:", error);
        return baseResponse(res, {
            success: false,
            statusCode: 400,
            msg: "Gửi OTP thất bại"
        });
    }
};

export { sendResetOtp };


