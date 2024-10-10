// src/utils/__tests__/shopifyUtils.test.js

const { fetchShopifyProducts, addArticleToShopify, ERROR_MISSING_REQUIRED_FIELDS, ERROR_INVALID_URL } = require('./shopifyUtils');

describe('Shopify Utils', () => {

  describe('fetchShopifyProducts', () => {
    it('should fetch products successfully', async () => {
      const products = await fetchShopifyProducts();
      expect(Array.isArray(products)).toBe(true);
      // console.log(products)

      // products shouldn't be empty
      expect(products.length).toBeGreaterThan(0);
    });
  });

  describe('addArticleToShopify', () => {
    const validArticle = {
      title: 'Test Article 1',
      url: 'http://example.com/test-url-1',
      description: 'Description for Test Article 1',
      thumbnail: 'http://example.com/test-url-1/image1.jpg'
    };
  
    it('add article', async () => {
      const results = await addArticleToShopify(validArticle);
      // console.log(results)
      expect(results).toMatchObject({
        success: true,
      });
    });


    // Helpers to create an article with missing fields
    const requiredFields = ['title', 'url'];//, 'description', 'thumbnail'];
    const createArticleWithMissingFields = (fieldsToRemove) => {
      const article = { ...validArticle };
      fieldsToRemove.forEach(field => delete article[field]);
      return article;
    };
  
    // Test for each single missing field
    requiredFields.forEach(field => {
      it(`should return an error if ${field} is missing`, async () => {
        const article = createArticleWithMissingFields([field]);
        const results = await addArticleToShopify(article);
        expect(results).toMatchObject({
          success: false,
          error: ERROR_MISSING_REQUIRED_FIELDS
        });
      });
    });
  
    // Test for each combination of two missing fields
    for (let i = 0; i < requiredFields.length; i++) {
      for (let j = i + 1; j < requiredFields.length; j++) {
        it(`should return an error if ${requiredFields[i]} and ${requiredFields[j]} are missing`, async () => {
          const article = createArticleWithMissingFields([requiredFields[i], requiredFields[j]]);
          const results = await addArticleToShopify(article);
          expect(results).toMatchObject({
            success: false,
            error: ERROR_MISSING_REQUIRED_FIELDS
          });
        });
      }
    }
  
    // Test for each combination of three missing fields
    for (let i = 0; i < requiredFields.length; i++) {
      for (let j = i + 1; j < requiredFields.length; j++) {
        for (let k = j + 1; k < requiredFields.length; k++) {
          it(`should return an error if ${requiredFields[i]}, ${requiredFields[j]}, and ${requiredFields[k]} are missing`, async () => {
            const article = createArticleWithMissingFields([requiredFields[i], requiredFields[j], requiredFields[k]]);
            const results = await addArticleToShopify(article);
            expect(results).toMatchObject({
              success: false,
              error: ERROR_MISSING_REQUIRED_FIELDS
            });
          });
        }
      }
    }
  
    // Test for all fields missing
    it('should return an error if all fields are missing', async () => {
      const article = createArticleWithMissingFields(requiredFields);
      const results = await addArticleToShopify(article);
      expect(results).toMatchObject({
        success: false,
        error: ERROR_MISSING_REQUIRED_FIELDS
      });
    });
  });
  

  // describe('removeExistingProducts', () => {
  //   it('should correctly remove existing products from articles', async () => {
  //     const articles = [
  //       { title: 'Existing Product', url: 'existing-url', description: 'Desc', thumbnail: 'thumb1' },
  //       { title: 'Unique New Product', url: 'unique-new-url', description: 'Desc', thumbnail: 'thumb2' },
  //     ];

  //     const result = await removeExistingProducts(articles);

  //     expect(result).toEqual([
  //       { title: 'Unique New Product', url: 'unique-new-url', description: 'Desc', thumbnail: 'thumb2' },
  //     ]);
  //   });
  // });


});