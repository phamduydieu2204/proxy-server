const axios = require('axios');

module.exports = async function getSoftwareListHandler(body, config) {
  try {
    const response = await axios.post(config.url, body, config.options);
    return response.data;
  } catch (error) {
    console.error("Lỗi lấy danh sách phần mềm:", error.message);
    return {
      status: "error",
      message: "Không thể lấy danh sách phần mềm.",
      details: error.message
    };
  }
};
