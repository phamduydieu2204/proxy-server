const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
  origin: ['https://phamduydieu2204.github.io', 'https://vidieu.vn'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

app.post('/api/proxy', async (req, res) => {
  try {
    console.log('Yêu cầu nhận được:', req.body);
    const response = await axios.post(
      'https://script.google.com/macros/s/AKfycbztdRummlfoDjdi5vZeW5WtAHHCreShA0cSBmcG9DLEIGhw81ebW_Q57wDXYDH1f4p2/exec',
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
    console.error('Lỗi khi gọi Google Apps Script:', error.message);
    res.status(500).json({ error: 'Lỗi khi gọi Google Apps Script', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server đang chạy trên cổng ${PORT}`);
});