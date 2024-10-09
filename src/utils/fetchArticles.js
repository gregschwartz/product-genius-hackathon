const fetch = require('node-fetch');
const cheerio = require('cheerio');
const httpsAgent = require('./httpsAgent');

const UNSUPPORTED_URL_ERROR = 'Unsupported URL. Please provide a URL from a supported site.';

/**
 * Fetch the HTML content of a given URL
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} - The HTML content of the page
 */
async function fetchPage(url) {
  const response = await fetch(url, { agent: httpsAgent });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.text();
}

/**
 * Parse articles from the HTML content of a given URL
 * Supports CNN, The Verge, and The Atlantic
 * @param {string} baseUrl - The base URL of the site
 * @param {string} url - The URL of the page
 * @param {string} content - The HTML content of the page
 * @returns {Array} - Array of parsed articles
 */
function parseArticles(baseUrl, url, content) {
  const supportedSites = {
    'cnn.com': parseCNN,
    'theverge.com': parseTheVerge,
    'theatlantic.com': parseTheAtlantic,
    // Add more sites here as needed
  };

  const siteKey = Object.keys(supportedSites).find(site => url.includes(site));
  
  if (!siteKey) {
    throw new Error(UNSUPPORTED_URL_ERROR);
  }
  
  const $ = cheerio.load(content);
  const parsedArticles = supportedSites[siteKey]($, url);
  return parsedArticles;
}

function validateAndExtractArticle($, article, selectors) {
  const title = $(article).find(selectors.title).text().trim();
  const relativeUrl = $(article).find(selectors.url).attr('href');
  const description = $(article).find(selectors.description).text().trim() || '';
  const thumbnail = $(article).find(selectors.thumbnail).attr('src') || '';

  if (!title) {
    return null;
  }

  if (!relativeUrl) {
    console.error(`Error: Missing URL for article with title "${title}" ${description ? ` and description "${description}"` : ''}`);
    return null;
  }

  const url = selectors.baseUrl + relativeUrl;
  const validThumbnail = /^https?:\/\/.+/.test(thumbnail) ? thumbnail : '';

  return {
    title,
    url,
    description,
    thumbnail: validThumbnail,
  };
}

function parseCNN($) {
  const parsedArticles = [];
  const articleElements = $('[data-component-name="card"]');

  articleElements.each((i, article) => {
    const articleData = validateAndExtractArticle($, article, {
      title: '.container__headline-text',
      url: 'a',
      description: 'p',
      thumbnail: 'img',
      baseUrl: 'https://www.cnn.com',
    });

    if (articleData) {
      parsedArticles.push(articleData);
    }
  });

  return parsedArticles;
}

function parseTheVerge($) {
  const parsedArticles = [];
  const articleElements = $('article, li.duet--content-cards--content-card, .group');

  articleElements.each((i, article) => {
    const articleData = validateAndExtractArticle($, article, {
      title: 'h2, h3',
      url: 'a',
      description: 'p',
      thumbnail: 'img',
      baseUrl: 'https://www.theverge.com',
    });

    if (articleData) {
      parsedArticles.push(articleData);
    }
  });

  return parsedArticles;
}

function parseTheAtlantic($) {
  const parsedArticles = [];
  const articleElements = $('article, .content, .tease, .article-wrapper, .story-block, .block-wrapper');

  articleElements.each((i, article) => {
    const articleData = validateAndExtractArticle($, article, {
      title: 'h2 a, h3 a, .headline a, .title a',
      url: 'h2 a, h3 a, .headline a, .title a',
      description: 'p, .description',
      thumbnail: 'img',
      baseUrl: 'https://www.theatlantic.com',
    });

    if (articleData) {
      parsedArticles.push(articleData);
    }
  });

  // console.log(parsedArticles);
  return parsedArticles;
}

module.exports = { fetchPage, parseArticles, UNSUPPORTED_URL_ERROR };
