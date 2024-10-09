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
    const content = await fetchPage(url);
    if (!content) {
      console.error(`No content found for ${site}`);
      continue;
    }

    const articles = parseArticles(url, content);
    if (articles.length === 0) {
      console.error(`No articles found for ${site}`);
      continue;
    }

    console.log(`${site}: ${articles.length} articles found`);

    // const articlesToAdd = removeExistingProducts(articles);

    for (const article of articles) {
      if (existingArticles.some(existingArticle => existingArticle.title === article.title)) {
        console.log(`\tAlready added: ${article.title}`);
        continue;
      }

      console.log(`\tNew article: ${article.title}`);

      continue;
      try {
        const addedArticle = await addArticleToShopify(article);
        console.log(`\tAdded: ${addedArticle.title}`);
      } catch (error) {
        console.error(`\tError adding article: ${article.title}, ${article.url}`, error);
      }
    }

    return;
  }
}

fetchArticlesRunnerLocalOnly();