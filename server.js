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