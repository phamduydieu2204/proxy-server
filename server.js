const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Chỉ cho phép truy cập từ domain của bạn
app.use(cors({
  origin: 'https://phamduydieu2204.github.io' // Thay bằng domain GitHub Pages của bạn
}));
app.use(express.json());

// Route chuyển tiếp yêu cầu đến Google Apps Script
app.post('/api/proxy', async (req, res) => {
  try {
    const response = await axios.post(
      'https://script.google.com/macros/s/AKfycbz1ESh_ksiFP5jde9GQAqZL2_rCssmENUFzUrjNSWfzzrypESB63XT2Cb0rcPOFxdbN/exec',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi gọi Google Apps Script', details: error.message });
  }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server đang chạy trên cổng ${PORT}`);
});const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Cấu hình CORS để cho phép truy cập từ GitHub Pages
app.use(cors({
  origin: 'https://phamduydieu2204.github.io'
}));
app.use(express.json());

// Route chuyển tiếp yêu cầu đến Google Apps Script
app.post('/api/proxy', async (req, res) => {
  try {
    console.log('Yêu cầu nhận được:', req.body); // Log dữ liệu nhận được
    const response = await axios.post(
      'https://script.google.com/macros/s/AKfycbz1ESh_ksiFP5jde9GQAqZL2_rCssmENUFzUrjNSWfzzrypESB63XT2Cb0rcPOFxdbN/exec',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Phản hồi từ Google Apps Script:', response.data); // Log phản hồi
    res.json(response.data);
  } catch (error) {
    console.error('Lỗi khi gọi Google Apps Script:', error.message);
    res.status(500).json({ error: 'Lỗi khi gọi Google Apps Script', details: error.message });
  }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server đang chạy trên cổng ${PORT}`);
});