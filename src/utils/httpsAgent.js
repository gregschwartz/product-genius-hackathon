// src/utils/httpsAgent.js
const https = require('https');

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // Ignore invalid SSL certificates
});

module.exports = httpsAgent;