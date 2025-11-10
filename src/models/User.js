const mongoose = require("mongoose");
const { Schema } = mongoose;

const OTP_EXPIRES_MS = parseInt(process.env.SESSION_ID_EXPIRES_MS) || 259200000; // 3 ngày

const userSchema = new Schema(
    {
        fullName: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
            maxLength: 200,
            default: ""
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
        isVerified: {
            type: Boolean,
            default: false,
        },
        profile: {
            type: Schema.Types.Mixed, // Cho phép mọi kiểu dữ liệu object (tùy ý)
            default: {},
        },
        age: {
            type: Number,
            min: 1,
            max: 150,
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        },
        occupation: {
            type: String,
            trim: true,
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
userSchema.statics.findByPhone = function (phone) {
    return this.findOne({ phone: phone });
};

const User = mongoose.model("User", userSchema);
module.exports = User;
