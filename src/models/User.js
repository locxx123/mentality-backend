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
        }
    },
    {
        timestamps: true,
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id.toString(); // chuyển ObjectId thành string
                delete ret._id;
                delete ret.__v;
                delete ret.password; // ẩn password khi trả về client
            }
        }
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
// userSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model("User", userSchema);
module.exports = User;
