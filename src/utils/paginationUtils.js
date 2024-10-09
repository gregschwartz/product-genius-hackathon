// src/utils/paginationUtils.js
function getNextPageUrl(currentUrl) {
  if (currentUrl.includes('?page=')) {
    const [baseUrl, query] = currentUrl.split('?');
    const params = new URLSearchParams(query);
    const page = parseInt(params.get('page')) || 1;
    params.set('page', page + 1);
    return `${baseUrl}?${params.toString()}`;
  } else {
    return `${currentUrl}?page=2`;
  }
}

module.exports = {
  getNextPageUrl,
};
