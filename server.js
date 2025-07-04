const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Debug middleware để log origin
app.use((req, res, next) => {
  console.log('🌐 Request from origin:', req.headers.origin);
  console.log('📋 Request method:', req.method);
  console.log('📍 Request path:', req.path);
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://phamduydieu2204.github.io',
      'https://vidieu.vn',
      'http://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080'
    ];
    
    // Check if origin is in allowed list or matches GitHub Pages pattern
    if (allowedOrigins.includes(origin) || origin.includes('phamduydieu2204.github.io')) {
      return callback(null, true);
    }
    
    console.log('❌ CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Handle preflight OPTIONS requests
app.options('/api/proxy', (req, res) => {
  console.log('✅ OPTIONS request received from:', req.headers.origin);
  res.status(200).end();
});

app.post('/api/proxy', async (req, res) => {
  try {
    console.log('Yêu cầu nhận được:', req.body);
    
    // Add authentication tokens required by GAS
    const dataWithAuth = {
      ...req.body,
      secretToken: '7b9f4c8e-1234-5678-9abc-def123456789',
      spreadsheetId: '1OKMn-g-mOm2MlsAOoWEMi3JjRlwfdw5IpVTRmwMKcHU'
    };
    
    const response = await axios.post(
      'https://script.google.com/macros/s/AKfycbxTAIyLZIDa3B3f6no8tqwE-CjTP-aiI5Dh9Hk90c2Kkk9DnH3qheQDvxt6xDW6q-X4/exec',
      dataWithAuth,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 500;
        }
      }
    );
    
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    
    if (response.status === 302 || response.status === 301) {
      res.status(502).json({
        error: 'Google Apps Script redirect detected',
        message: 'The deployment needs to be configured with "Anyone" access',
        status: response.status
      });
    } else if (response.status !== 200) {
      res.status(response.status).json({
        error: 'Google Apps Script error',
        status: response.status,
        data: response.data
      });
    } else {
      res.json(response.data);
    }
  } catch (error) {
    console.error('Lỗi khi gọi Google Apps Script:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ 
      error: 'Lỗi khi gọi Google Apps Script', 
      details: error.message,
      status: error.response?.status
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy server đang chạy trên cổng ${PORT}`);
});