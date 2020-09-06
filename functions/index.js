const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bearerToken = require('express-bearer-token');
const cors = require('cors');
const app = express();
const corsOptions = {
    origin: ['http://localhost:8080', 'https://kages-controlling.web.app'],
    allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Methods", "Access-Control-Request-Headers"],
    credentials: true,
    enablePreflight: true
}

app.use(cors(corsOptions));
app.use(bearerToken());
app.options('*', cors(corsOptions));

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

app.get('/api/bong', (req, res) => {
    admin.initializeApp({
        credential: admin.credential.applicationDefault()
    });

    admin.auth().verifyIdToken(req.token)
    .then((decodedToken) => {
      let uid = decodedToken.uid;
      // res.set('Cache-Control', 'public, max-age=300, s-maxage=400')
      const date = new Date();
      const hours = (date.getHours() % 12) + 2;  // London is UTC + 1hr;
      return res.json({bongs: 'BONG '.repeat(hours), time: date.getTime(), token: req.token, uid: uid});
    }).catch((error) => {
      // Handle error
      res
        .status(401)
        .send({ error: 'You are not authorized to make this request' });
    });

  });

exports.app = functions.https.onRequest(app);
