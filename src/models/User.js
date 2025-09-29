const mongoose = require("mongoose");
const { Schema } = mongoose;

const OTP_EXPIRES_MS = parseInt(process.env.SESSION_ID_EXPIRES_MS) || 259200000; // 3 ngày

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            required: true,
            unique: true,
        },
        avatar: {
            type: String,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
        },
        sessionId: {
            type: String,
            unique: true,
        },
        expires_at: {
            type: Date,
            required: true,
            default: () => new Date(Date.now() + OTP_EXPIRES_MS)
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        profile: {
            type: Schema.Types.Mixed, // Cho phép mọi kiểu dữ liệu object (tùy ý)
            default: {},
        },
        friends: [
            {
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: "User", // id của user
                    required: true,
                },
                status: {
                    type: String,
                    enum: ["pending", "accepted", "declined"],
                    default: "pending",
                },
                invitedAt: {
                    type: Date,
                    default: Date.now,
                },
                acceptedAt: {
                    type: Date,
                }
            }
        ]
    },
    {
        timestamps: true,
    }
);

userSchema.statics.findByEmail = function (email) {
    return this.findOne({ email: email });
};
userSchema.statics.findBySessionId = function (sessionId) {
    return this.findOne({ sessionId: sessionId });
};
userSchema.statics.findByPhone = function (phone) {
    return this.findOne({ phone: phone });
};

// Index để tự động xóa document hết hạn
userSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model("User", userSchema);
module.exports = User;
