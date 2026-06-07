const { onRequest } = require('firebase-functions/v2/https');
const app = require('./server.js');

exports.api = onRequest({ cors: true, maxInstances: 10 }, app);
