require('dotenv').config();

// Cấu hình module-alias với đường dẫn tuyệt đối để hoạt động trên Vercel
const path = require('path');
const moduleAlias = require('module-alias');

// Lấy đường dẫn gốc của project
const rootPath = path.resolve(__dirname);

// Đăng ký aliases với đường dẫn tuyệt đối
moduleAlias.addAliases({
  '@src': path.join(rootPath, 'src'),
  '@controllers': path.join(rootPath, 'src/controllers'),
  '@middleware': path.join(rootPath, 'src/middleware'),
  '@models': path.join(rootPath, 'src/models'),
  '@services': path.join(rootPath, 'src/services'),
  '@routes': path.join(rootPath, 'src/routes'),
  '@utils': path.join(rootPath, 'src/utils'),
  '@validations': path.join(rootPath, 'src/validations'),
  '@config': path.join(rootPath, 'src/config'),
  '@helpers': path.join(rootPath, 'src/helpers'),
});

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
