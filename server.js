const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(cors({
  origin: 'https://phamduydieu2204.github.io',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

app.post('/api/proxy', async (req, res) => {
  try {
    console.log('Yêu cầu nhận được:', req.body);
    const response = await axios.post(
      'https://script.google.com/macros/s/AKfycbyTZLJpxATMjzgoBmPyg3NJkye0fLlb1pFzdg66DXiw7QKUXfxpi9wLhbr71vR18cdn/exec',
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