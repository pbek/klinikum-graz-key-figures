const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();
const corsOptions = {
    origin: ['http://localhost:8080', 'https://kages-controlling.web.app'],
    allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Methods", "Access-Control-Request-Headers"],
    credentials: true,
    enablePreflight: true
}

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

app.get('/api/bong', (req, res) => {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=400')
    const date = new Date();
    const hours = (date.getHours() % 12) + 2;  // London is UTC + 1hr;
    res.json({bongs: 'BONG '.repeat(hours), time: date.getTime()});
  });

exports.app = functions.https.onRequest(app);
