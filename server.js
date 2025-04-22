require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

// ⚠️ CORS phải khai báo TRƯỚC các route
const corsOptions = {
  origin: 'https://phamduydieu2204.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // CORS cho preflight

app.use(express.json());

app.post('/api/proxy', async (req, res) => {
  try {
    const dataWithToken = {
      ...req.body,
      authToken: process.env.SECRET_TOKEN
    };

    console.log("🟢 [Proxy] Nhận từ client:", req.body);
    console.log("🟡 [Proxy] Thêm token, gửi tới GAS:", dataWithToken);


    const response = await axios.post(
      `${GOOGLE_SCRIPT_URL}?authToken=${encodeURIComponent(SCRIPT_AUTH_TOKEN)}`,
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );    
    console.log("✅ [Proxy] Nhận phản hồi từ GAS:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ [Proxy] Lỗi khi gọi GAS:", error.message);
    if (error.response) {
      console.error("❌ [Proxy] GAS trả về lỗi:", error.response.data);
    }
    res.status(500).json({ error: "Lỗi khi gọi GAS", details: error.response?.data || error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server đang chạy ở cổng ${PORT}`);
});
