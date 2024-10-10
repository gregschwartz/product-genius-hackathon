const fetch = require('node-fetch');
const cheerio = require('cheerio');
const httpsAgent = require('./httpsAgent');

const UNSUPPORTED_URL_ERROR = 'Unsupported URL. Please provide a URL from a supported site.';

const minimumLength = {
  title: 20,
  url: 9,
  thumbnail: 10,
  // description: 10,
};

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
    'theguardian.com': parseTheGuardian,
    // Add more sites here as needed
  };

  const siteKey = Object.keys(supportedSites).find(site => url.includes(site));
  
  if (!siteKey) {
    throw new Error(UNSUPPORTED_URL_ERROR);
  }
  
  const $ = cheerio.load(content);
  const parsedArticles = supportedSites[siteKey]($, url);

  // Filter out articles missing required fields
  const filteredArticles = parsedArticles.filter(article => {
    let isValid = true;
    Object.keys(minimumLength).forEach(field => {
      if (!article[field] || article[field].length < minimumLength[field]) {
        isValid = false;
        console.log(`\t\t"${article.title}": too short: ${field}: "${article[field]}"`);
      }
    });
    return isValid;
  });

  return filteredArticles;
}

function validateAndExtractArticle($, article, selectors) {
  const title = $(article).find(selectors.title).text().trim();
  let url = $(article).find(selectors.url).attr('href');
  const description = $(article).find(selectors.description).text().trim() || '';
  let thumbnail = $(article).find(selectors.thumbnail).attr('src') || '';
  
  // Can't work without a URL
  if (!url) {
    console.error(`Error: Missing URL for article with title "${title}" ${description ? ` and description "${description}"` : ''}`);
    return null;
  } else if (!url.startsWith('http')) {
    url = selectors.baseUrl + url;
  }
  
  // debug for The Verge
  if (selectors.baseUrl.includes('theverge.com') && !/^https?:\/\/.+/.test(thumbnail) ) {
    console.log("thumbnail", thumbnail, $(article).find(selectors.thumbnail).html());// , $(article).html());
  }
  
  //validThumbnail 
  if (!/^https?:\/\/.+/.test(thumbnail) ) {
    console.log("thumbnail", thumbnail, $(article).html());
    thumbnail = '';
  }

  return {
    title,
    url,
    description,
    thumbnail,
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
      thumbnail: 'img, noscript img',
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

function parseTheGuardian($) {
  const parsedArticles = [];
  const articleElements = $('li');

  articleElements.each((i, article) => {
    const articleData = validateAndExtractArticle($, article, {
      title: 'h3 span',
      url: 'a',
      description: 'h3 div',
      thumbnail: 'img',
      baseUrl: 'https://www.theguardian.com',
    });

    if (articleData) {
      parsedArticles.push(articleData);
    }
  });

  return parsedArticles;
}

module.exports = { fetchPage, parseArticles, UNSUPPORTED_URL_ERROR };