const { fetchPage, parseArticles } = require('./fetchArticles');
const { addArticleToShopify, fetchShopifyProducts, removeExistingProducts } = require('./shopifyUtils');

const supportedSites = [
  'cnn.com',
  'theverge.com',
  'theatlantic.com',
];

async function fetchArticlesRunnerLocalOnly() {
  const existingArticles = await fetchShopifyProducts();

  for (const site of supportedSites) {
    const url = `https://${site}`;
    const content = await fetchPage(url);
    if (!content) {
      console.error(`\tNo content found for ${site}`);
      continue;
    }
    console.log(`${site}: ${content.length} characters`);

    const articles = parseArticles(site, url, content);
    if (articles.length === 0) {
      console.error(`\tNo articles found`);
      continue;
    }

    console.log(`\t${articles.length} articles found`);

    // const articlesToAdd = removeExistingProducts(articles);
    // console.log(`\tsmart filter: ${articlesToAdd.length} articles to add`);

    for (const article of articles) {
      if (existingArticles.some(existingArticle => existingArticle.title === article.title)) {
        console.log(`\tAlready added: ${article.url}`);
        continue;
      }

      console.log(`\tNew article: ${article.title}`);

      try {
        const result = await addArticleToShopify(article);
        if (result.success) {
          console.log(`\t\tAdded: ${result.productId}`);
        } else if (result.missingFields) {
          console.log(`\t\tMissing fields: ${result.missingFields}`);
          throw new Error(`Error: Missing fields: ${result.missingFields}`);
          return;
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error(`\t\tError adding article:`, article, error);
      }
    }
  }
}

fetchArticlesRunnerLocalOnly();