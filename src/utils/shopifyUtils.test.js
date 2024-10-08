// src/utils/__tests__/shopifyUtils.test.js

const { fetchShopifyProducts } = require('./shopifyUtils');

describe('Shopify Utils', () => {

  describe('fetchShopifyProducts', () => {
    it('should fetch products successfully', async () => {
      const products = await axiosFetch();
      expect(Array.isArray(products)).toBe(true);
      console.log(products);
    });
  });

});