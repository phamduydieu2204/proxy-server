require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const winston = require('winston');

const app = express();
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

app.use(cors({
  origin: 'https://phamduydieu2204.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

app.options('/api/proxy', cors());

app.post('/api/proxy', async (req, res) => {
  try {
    logger.info('Yêu cầu nhận được', { body: req.body });
    const response = await axios.post(
      process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxsIg9ZSE1bMuaRQGABZgpVDs3ZaLxa07A39fbusIk9uQTsjDDbsDPwBstnZsT7mXM/exec',
      req.body,
      {
        headers: { 'Content-Type': 'application/json' },
        params: { authToken: process.env.SCRIPT_AUTH_TOKEN }
      }
    );
    logger.info('Phản hồi từ Google Apps Script', { data: response.data });
    res.json(response.data);
  } catch (error) {
    logger.error('Lỗi khi gọi Google Apps Script', { message: error.message, stack: error.stack });
    res.status(500).json({ error: 'Lỗi khi gọi Google Apps Script', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Proxy server đang chạy trên cổng ${PORT}`);
});