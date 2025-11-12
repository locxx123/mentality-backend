require('dotenv').config();
require('module-alias/register');
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./src/config/database");
const routes = require("./src/routes/index");

const port = 3000;


const app = express();
// 1. Kết nối MongoDB
connectDB();

app.use(cors({
    origin: ["http://localhost:5173","https://metality-fe.vercel.app"],
    credentials: true
}));

// 2.5. Cấu hình cookie parser
app.use(cookieParser());

// 3. Cấu hình parse JSON body (tăng limit để nhận base64 image)
app.use(express.json({ limit: '15mb' }));

// 4. Khai báo route chính
app.use('/api/v1', routes);

// 5. Khởi động server
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}
module.exports = app;
