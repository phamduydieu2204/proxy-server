const axios = require('axios');

module.exports = async function updateTransactionHandler(body, config) {
  try {
    const response = await axios.post(config.url, body, config.options);
    return response.data;
  } catch (error) {
    console.error("Lỗi cập nhật giao dịch:", error.message);
    return {
      status: "error",
      message: "Không thể cập nhật giao dịch.",
      details: error.message
    };
  }
};
