const axios = require('axios');

module.exports = async function addTransactionHandler(body, config) {
  try {
    const response = await axios.post(config.url, body, config.options);
    return response.data;
  } catch (error) {
    console.error("Lỗi thêm giao dịch:", error.message);
    return {
      status: "error",
      message: "Không thể thêm giao dịch.",
      details: error.message
    };
  }
};
