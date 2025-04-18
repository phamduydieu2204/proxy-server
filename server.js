const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS with explicit configuration
app.use(cors({
  origin: 'https://phamduydieu2204.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: false,
  optionsSuccessStatus: 204
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// Log incoming requests for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Origin: ${req.headers.origin} - Headers: ${JSON.stringify(req.headers)}`);
  res.setHeader('Access-Control-Allow-Origin', 'https://phamduydieu2204.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

app.post('/api/proxy', async (req, res) => {
  try {
    console.log('Yêu cầu nhận được:', JSON.stringify(req.body, null, 2));
    const response = await axios.post(
      'https://script.google.com/macros/s/AKfycbwcu4vCtekNFVaBLM19j2l2Pu9gYv91U4AD1tx5_VY8J5PEmQGhX4ByApixa01gO1sI/exec',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    console.log('Phản hồi từ Google Apps Script:', JSON.stringify(response.data, null, 2));
    res.json(response.data);
  } catch (error) {
    console.error('Lỗi khi gọi Google Apps Script:', error.message, error.stack);
    res.status(500).json({ error: 'Lỗi khi gọi Google Apps Script', details: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server đang chạy trên cổng ${PORT}`);
});