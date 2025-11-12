require('dotenv').config();
require('module-alias/register');
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./src/config/database");
const routes = require("./src/routes/index");

const app = express();

(async () => {
  try {
    // Kết nối DB
    await connectDB();
    console.log("✅ MongoDB connected");

    // Cấu hình CORS
    app.use(cors({
      origin: [
        "http://localhost:5173",
        "https://metality-fe.vercel.app"
      ],
      credentials: true,
    }));

    app.use(cookieParser());
    app.use(express.json({ limit: '15mb' }));

    app.use('/api/v1', routes);

    // Xuất app cho Vercel
    module.exports = app;

    // Chỉ listen khi chạy local
    if (process.env.NODE_ENV !== "production") {
      const port = process.env.PORT || 3000;
      app.listen(port, () => console.log(`Local server running at http://localhost:${port}`));
    }
  } catch (err) {
    console.error("❌ Server initialization failed:", err);
  }
})();
