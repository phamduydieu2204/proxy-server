const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowed = ['http://localhost:8080', 'https://phamduydieu2204.github.io'];
    if (!origin || allowed.includes(origin)) return callback(null, true);
    return callback(new Error('CORS not allowed'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '1mb' }));

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
    return res.status(400).json({ status: 'error', message: 'Action không hợp lệ: ' + action });
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
  } catch (err) {
    console.error(`Lỗi xử lý "${action}":`, err.message);
    res.status(500).json({ status: 'error', message: 'Lỗi hệ thống proxy.', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy server chạy tại cổng ${PORT}`);
});