require('dotenv').config(); // Đọc .env

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
const SCRIPT_AUTH_TOKEN = process.env.SCRIPT_AUTH_TOKEN;

const corsOptions = {
  origin: 'https://phamduydieu2204.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Xử lý preflight

app.use(express.json());

app.post('/api/proxy', async (req, res) => {
  try {
    console.log('Yêu cầu nhận được:', req.body);

    const dataWithToken = {
      ...req.body,
      authToken: SCRIPT_AUTH_TOKEN
    };

    const response = await axios.post(
      GOOGLE_SCRIPT_URL,
      dataWithToken,
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
