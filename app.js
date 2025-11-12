const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./src/config/database");
const routes = require("./src/routes/index");

const app = express();

// 1️⃣ CORS middleware chạy trước tất cả
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://metality-fe.vercel.app"
    ],
    credentials: true,
}));

// 2️⃣ Bật OPTIONS preflight cho tất cả route
app.options('*', cors({
    origin: [
        "http://localhost:5173",
        "https://metality-fe.vercel.app"
    ],
    credentials: true
}));

// 3️⃣ Cookie + JSON parser
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));

// 4️⃣ Routes chính
app.use('/api/v1', routes);

// 5️⃣ Async connect DB
(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

// 6️⃣ Export app cho Vercel
module.exports = app;

// 7️⃣ Chỉ listen local
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Local server running at http://localhost:${port}`));
}
