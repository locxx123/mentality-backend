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

// Cấu hình middleware ngay lập tức (không cần đợi DB)
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

// Kết nối DB (chạy async nhưng không block export)
(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

// Xuất app cho Vercel ngay lập tức
module.exports = app;

// Chỉ listen khi chạy local
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Local server running at http://localhost:${port}`));
}
