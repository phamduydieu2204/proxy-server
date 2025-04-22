const axios = require('axios');
module.exports = async function (body, config) {
  const res = await axios.post(config.url, body, config.options);
  return res.data;
};