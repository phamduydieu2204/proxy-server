const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();

// CORS chỉ cho phép từ frontend GitHub của bạn
app.use(cors({
  origin: 'https://phamduydieu2204.github.io'
}));

app.use(express.json({ limit: '1mb' }));

// Tự động nạp tất cả các file controller
const controllers = {};
const controllersPath = path.join(__dirname, 'controllers');

fs.readdirSync(controllersPath).forEach(file => {
  if (file.endsWith('.js')) {
    const action = file.replace('.js', '');
    controllers[action] = require(path.join(controllersPath, file));
  }
});

app.post('/api/proxy', async (req, res) => {
  const action = req.body.action;

  if (!action || !controllers[action]) {
    return res.status(400).json({
      status: 'error',
      message: `Action không hợp lệ: ${action}`
    });
  }

  const config = {
    url: process.env.GOOGLE_SCRIPT_URL,
    options: {
      headers: { 'Content-Type': 'application/json' },
      params: { authToken: process.env.SCRIPT_AUTH_TOKEN }
    }
  };

  try {
    const result = await controllers[action](req.body, config);
    res.json(result);
  } catch (error) {
    console.error(`Lỗi xử lý action "${action}":`, error.message);
    res.status(500).json({
      status: 'error',
      message: 'Lỗi hệ thống proxy.',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy server đang chạy tại cổng ${PORT}`);
});
