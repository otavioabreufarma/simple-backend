const axios = require('axios');

const API_URL = 'https://api.infinitepay.io/invoices/public/checkout/links';

module.exports = {
  async createCheckout({ handle, items, order_nsu, redirect_url, webhook_url }) {
    const response = await axios.post(API_URL, {
      handle,
      items,
      order_nsu,
      redirect_url,
      webhook_url
    });

    return response.data;
  }
};
