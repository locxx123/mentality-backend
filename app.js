const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./src/config/database");
const routes = require("./src/routes/index");

const app = express();

// Danh sách origins được phép
const allowedOrigins = [
    "http://localhost:5173",
    "https://metality-fe.vercel.app"
];

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Cho phép requests không có origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['x-token-refreshed']
};

// 1️⃣ CORS middleware chạy trước tất cả
app.use(cors(corsOptions));

// 2️⃣ Xử lý preflight requests (OPTIONS) cho tất cả routes
app.options('*', cors(corsOptions));

// 3️⃣ Thêm headers middleware để đảm bảo headers luôn được set
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
        res.header('Access-Control-Expose-Headers', 'x-token-refreshed');
    }
    
    // Xử lý preflight request
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// 4️⃣ Cookie + JSON parser
app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));

// 5️⃣ Routes chính
app.use('/api/v1', routes);

// 6️⃣ Async connect DB
(async () => {
  try {
    await connectDB();
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

// 7️⃣ Export app cho Vercel
module.exports = app;

// 8️⃣ Chỉ listen local
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Local server running at http://localhost:${port}`));
}
