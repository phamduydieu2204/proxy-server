const axios = require('axios');

module.exports = async function loginHandler(body, config) {
  try {
    const response = await axios.post(config.url, body, config.options);

    // Trả về dữ liệu người dùng nếu đăng nhập thành công
    return response.data;
  } catch (error) {
    return {
      status: "error",
      message: "Lỗi khi đăng nhập",
      details: error.message
    };
  }
};
