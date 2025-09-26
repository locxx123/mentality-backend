const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail", // Hoặc SMTP của bạn
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendOtpEmail(to, otp) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Your OTP Code",
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);
    return otp;
}

module.exports = { sendOtpEmail };
