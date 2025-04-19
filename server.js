require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');
const winston = require('winston');

// Khởi tạo ứng dụng Express
const app = express();

// Khởi tạo cache với thời gian sống 10 phút
const cache = new NodeCache({ stdTTL: 600 });

// Khởi tạo logger với Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'app.log' }),
    new winston.transports.Console()
  ]
});

// Cấu hình CORS để chỉ cho phép origin cụ thể
app.use(cors({
  origin: 'https://phamduydieu2204.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// Giới hạn kích thước JSON payload để tránh tấn công DDoS
app.use(express.json({ limit: '1mb' }));

// Endpoint proxy để chuyển tiếp request tới Google Apps Script
app.post('/api/proxy', async (req, res) => {
  try {
    logger.info('Yêu cầu nhận được', { body: req.body });

    // Kiểm tra cache
    const cacheKey = JSON.stringify(req.body);
    const cached = cache.get(cacheKey);
    if (cached) {
      logger.info('Trả về từ cache', { cacheKey });
      return res.json(cached);
    }

    // Gửi request tới Google Apps Script
    const response = await axios.post(
      process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxioKJcJps99iNtlAnwf4Uu5IYLOOlCpUh0H9lNBk83uRWE_-ln3r945oGzvG9cP5-V/exec',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        params: {
          authToken: process.env.SCRIPT_AUTH_TOKEN || 'your-secret-token'
        }
      }
    );

    logger.info('Phản hồi từ Google Apps Script', { data: response.data });

    // Lưu vào cache
    cache.set(cacheKey, response.data);

    // Trả về phản hồi
    res.json(response.data);
  } catch (error) {
    logger.error('Lỗi khi gọi Google Apps Script', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Lỗi khi gọi Google Apps Script', details: error.message });
  }
});

// Lắng nghe trên cổng được cấu hình
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Proxy server đang chạy trên cổng ${PORT}`);
});