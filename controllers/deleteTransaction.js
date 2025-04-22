const axios = require('axios');

module.exports = async function deleteTransactionHandler(body, config) {
  try {
    const response = await axios.post(config.url, body, config.options);
    return response.data;
  } catch (error) {
    console.error("Lỗi xóa giao dịch:", error.message);
    return {
      status: "error",
      message: "Không thể xóa giao dịch.",
      details: error.message
    };
  }
};
