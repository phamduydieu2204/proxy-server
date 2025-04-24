const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Cấu hình CORS
const corsOptions = {
  origin: 'https://phamduydieu2204.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

// Xử lý yêu cầu OPTIONS (preflight) rõ ràng
app.options('/api/proxy', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': 'https://phamduydieu2204.github.io',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours
  });
  res.status(204).send();
});

app.use(express.json());

app.post('/api/proxy', async (req, res) => {
  try {
    console.log('Yêu cầu nhận được:', req.body);
    const response = await axios.post(
      process.env.GOOGLE_SCRIPT_URL,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Phản hồi từ Google Apps Script:', response.data);
    // Đảm bảo header CORS được thêm vào phản hồi POST
    res.set('Access-Control-Allow-Origin', 'https://phamduydieu2204.github.io');
    res.json(response.data);
  } catch (error) {
    console.error('Lỗi khi gọi Google Apps Script:', error.response ? error.response.status : error.message);
    console.error('Chi tiết lỗi:', error.response ? error.response.data : error.message);
    res.set('Access-Control-Allow-Origin', 'https://phamduydieu2204.github.io');
    res.status(error.response ? error.response.status : 500).json({
      status: 'error',
      message: error.response ? error.response.statusText : 'Lỗi khi gọi Google Apps Script',
      details: error.response ? error.response.data : error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server đang chạy trên cổng ${PORT}`);
});