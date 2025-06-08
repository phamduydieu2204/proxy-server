const axios = require('axios');
module.exports = async function refreshHandler(body, config) {
  // Dùng lại getTransactions nếu cần làm mới
  body.action = 'getTransactions';
  const response = await axios.post(config.url, body, config.options);
  return response.data;
};
