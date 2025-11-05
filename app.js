require('dotenv').config();
require('module-alias/register');
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./src/config/database");
const routes = require("./src/routes/index");
const { server, app } = require("./src/lib/socket");

const port = 3000;

// 1. Kết nối MongoDB
connectDB();

app.use(cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:5500"],
    credentials: true
}));

// 3. Cấu hình parse JSON body (tăng limit để nhận base64 image)
app.use(express.json({ limit: '15mb' }));

// 4. Khai báo route chính
app.use('/api/v1', routes);

// 5. Khởi động server
server.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
