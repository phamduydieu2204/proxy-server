const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Cấu hình CORS
app.use(cors({
  origin: 'https://phamduydieu2204.github.io', // Origin được phép
  methods: ['GET', 'POST', 'OPTIONS'], // Phương thức được phép
  allowedHeaders: ['Content-Type', 'Authorization'], // Header được phép
  credentials: true, // Nếu cần hỗ trợ cookies hoặc authentication
}));

// Xử lý yêu cầu OPTIONS (preflight) một cách rõ ràng
app.options('/api/proxy', cors());

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
    res.json(response.data);
  } catch (error) {
    console.error('Lỗi khi gọi Google Apps Script:', error.response ? error.response.status : error.message);
    console.error('Chi tiết lỗi:', error.response ? error.response.data : error.message);
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