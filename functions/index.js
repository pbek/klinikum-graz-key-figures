const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bearerToken = require('express-bearer-token');
// const ExcelJS = require('exceljs');

// polyfills required by exceljs for node.js 8
// https://github.com/exceljs/exceljs#es5-imports
require('core-js/modules/es.promise');
require('core-js/modules/es.string.includes');
require('core-js/modules/es.object.assign');
require('core-js/modules/es.object.keys');
require('core-js/modules/es.symbol');
require('core-js/modules/es.symbol.async-iterator');
require('regenerator-runtime/runtime');

const ExcelJS = require('exceljs/dist/es5');
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
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: "kages-controlling.appspot.com"
});
const bucket = admin.storage().bucket();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

app.get('/api/data', (req, res) => {

    admin.auth().verifyIdToken(req.token || '')
    .then(async (decodedToken) => {
      let uid = decodedToken.uid;
      res.set('Cache-Control', 'public, max-age=5, s-maxage=6')
      const date = new Date();
      const hours = (date.getHours() % 12) + 2;  // London is UTC + 1hr;

      // get the list of files on the storage
      const [files] = await bucket.getFiles();
      if (files.length === 0) {
        return res
          .status(500)
          .send({ error: 'No files were found on the storage!' });
      }

      // download the first file as stream
      const file = files[0];
      const stream = file.createReadStream()
        .on('error', (err) => {
            console.error(`Could not download file '${file.name}': ${err.message}`);
        })
        .on('end', () => {
            // The file is fully downloaded.
            console.log("End of download!");
        });

      // open the file stream
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.read(stream);
      const value = workbook.worksheets[0].getCell("A1").value;
  
      return res.json({bongs: 'BONG '.repeat(hours), time: date.getTime(), token: req.token, uid: uid, value: value});
    }).catch((error) => {
      // Handle error
      console.error(error.message);

      return res
        .status(401)
        .send({ error: 'You are not authorized to make this request: ' + error.message });
    });

  });

exports.app = functions.https.onRequest(app);
