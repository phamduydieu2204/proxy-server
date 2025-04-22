const axios = require('axios');

module.exports = async function getTransactionsHandler(body, config) {
  try {
    const response = await axios.post(config.url, body, config.options);
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy giao dịch:", error.message);
    return {
      status: "error",
      message: "Không thể lấy danh sách giao dịch.",
      details: error.message
    };
  }
};
