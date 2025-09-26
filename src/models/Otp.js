const mongoose = require("mongoose");

// Lấy thời gian expires từ env
const OTP_EXPIRES_MS = parseInt(process.env.OTP_EXPIRES_MS) || 120000; // 2 phút

const otpSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email là bắt buộc'],
        },
        otp: {
            type: String,
            required: [true, 'Mã OTP là bắt buộc'],
            length: 6
        },
        expires_at: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + OTP_EXPIRES_MS)
        },
        is_used: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

// Index để tự động xóa document hết hạn
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Index để tìm kiếm nhanh theo số điện thoại
otpSchema.index({ email: 1 });

const Otp = mongoose.model("Otp", otpSchema);

module.exports = Otp;