// src/utils/shopifyUtils.js

require('dotenv').config();
const axios = require('axios');

if (!process.env.SHOPIFY_CLIENT_KEY || !process.env.SHOPIFY_CLIENT_SECRET || !process.env.SHOPIFY_STORE_URL){// || !process.env.SHOPIFY_ACCESS_TOKEN) {
  throw new Error(`Missing required environment variables for Shopify API: ${process.env.SHOPIFY_CLIENT_KEY}, ${process.env.SHOPIFY_CLIENT_SECRET}, ${process.env.SHOPIFY_STORE_URL}, ${process.env.SHOPIFY_ACCESS_TOKEN}`);
}

async function fetchShopifyProducts() {
  const url = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/2023-01/products.json`;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    console.log('Products fetched successfully:', response.data.products);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error.response ? error.response.data : error.message);
    throw error;
  }
}

module.exports = {
  fetchShopifyProducts,
};
