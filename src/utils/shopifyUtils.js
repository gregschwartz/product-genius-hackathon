// src/utils/shopifyUtils.js
const ERROR_MISSING_REQUIRED_FIELDS = 'Missing required field(s) for article';
const ERROR_INVALID_URL = 'Error parsing URL';

require('dotenv').config();
const axios = require('axios');

if (!process.env.SHOPIFY_CLIENT_KEY || !process.env.SHOPIFY_CLIENT_SECRET || !process.env.SHOPIFY_STORE_URL || !process.env.SHOPIFY_ACCESS_TOKEN) {
  throw new Error(`Missing required environment variables for Shopify API: ${process.env.SHOPIFY_CLIENT_KEY}, ${process.env.SHOPIFY_CLIENT_SECRET}, ${process.env.SHOPIFY_STORE_URL}, ${process.env.SHOPIFY_ACCESS_TOKEN}`);
}

const SHOPIFY_API_VERSION = '2023-01';

async function fetchShopifyProducts() {
  const url = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/products.json`;

  try {
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    // console.log('Products fetched successfully:', response.data.products);
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error.response ? error.response.data : error.message);
    throw error;
  }
}

/**
 * Adds the selected articles as products to Shopify.
 * @param {Array} selectedArticles - The list of articles to add.
 * @returns {Promise<Array>} The results of adding each article.
 */
async function addArticleToShopify(article) {
  // Make sure it has title, description, at least one thumbnail, url
  const { title, description, thumbnail, url } = article;
  if (!title || !description || !thumbnail || !url) {
    // console.error('Missing required field(s) for article:', article);
    return ({ success: false, error: ERROR_MISSING_REQUIRED_FIELDS, article });
  }

  let hostname = '';
  try {
    hostname = new URL(url).hostname;
  } catch (error) {
    // console.error('Error parsing URL:', error);
    return ({ success: false, error: ERROR_INVALID_URL, article });
  }

  try {
    const productData = {
      product: {
        title: title,
        body_html: description,
        vendor: 'News Importer',
        images: [{ src: thumbnail }],
        tags: [
          url
        ],
        options: [
          { name: 'URL', values: [url] },
          { name: 'Publication', values: [hostname] },
        ],
        variants: [
          {
            option1: url,
            option2: hostname,
          },
        ],
      },
    };

    const apiUrl = `https://${process.env.SHOPIFY_STORE_URL}/admin/api/${SHOPIFY_API_VERSION}/products.json`;
    const response = await axios.post(apiUrl, productData, {
      headers: {
        'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (response.errors) {
      throw new Error(JSON.stringify(response.errors));
    }

    const productId = response.data.product.id;
    // console.log(`${productId}: Added article: ${title}`); // Logging the added article
    return ({ success: true, productId });
  } catch (error) {
    // console.error(`Error adding article "${title}" to Shopify:`, error);
    return ({ success: false, error: error.message, article });
  }
}

/**
 * Removes articles that already exist in Shopify.
 * @param {Array} articles - The list of articles to check.
 * @returns {Promise<Array>} The list of articles that do not exist in Shopify.
 */
async function removeExistingProducts(articles) {
  const existingProducts = await fetchShopifyProducts();

  return articles.filter((article) => {
    const exists = existingProducts.find((product) => {
      const articleUrlVariant = product.variants.find(
        (variant) => variant.option1 === article.url
      );
      return product.title === article.title || articleUrlVariant;
    });

    if (exists) {
      console.log(`Article "${article.title}" already exists in Shopify.`);
      // Exclude the article from being added
      return false;
    }

    return true;
  });
}

module.exports = {
  fetchShopifyProducts,
  addArticleToShopify,
  removeExistingProducts,
  ERROR_MISSING_REQUIRED_FIELDS,
  ERROR_INVALID_URL,
};
