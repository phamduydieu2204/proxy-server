const axios = require('axios');

module.exports = async function searchTransactionsHandler(body, config) {
  try {
    const response = await axios.post(config.url, body, config.options);
    return response.data;
  } catch (error) {
    console.error("Lỗi tìm kiếm:", error.message);
    return {
      status: "error",
      message: "Không thể tìm kiếm giao dịch.",
      details: error.message
    };
  }
};
