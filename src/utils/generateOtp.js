// Hàm sinh OTP 6 số
const generateOtp = (length = 6) => {
  return Math.floor(100000 + Math.random() * 900000).toString().slice(0, length);
}

export { generateOtp };
