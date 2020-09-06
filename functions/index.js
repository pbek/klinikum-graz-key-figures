const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const bearerToken = require('express-bearer-token');
const ExcelJS = require('exceljs');
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
    credential: admin.credential.applicationDefault()
});
const bucket = admin.storage().bucket('default');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

app.get('/api/bong', (req, res) => {

    admin.auth().verifyIdToken(req.token || '')
    .then(async (decodedToken) => {
      let uid = decodedToken.uid;
      // res.set('Cache-Control', 'public, max-age=300, s-maxage=400')
      const date = new Date();
      const hours = (date.getHours() % 12) + 2;  // London is UTC + 1hr;

      const destFilename = 'test-local.xlsx';
      const options = {
        // The path to which the file should be downloaded, e.g. "./file.txt"
        destination: destFilename,
      };

      // https://medium.com/javascript-in-plain-english/how-to-download-files-from-firebase-storage-in-node-js-d5ffe798728
      // TODO: file has 0 Byte, get correct file
      await bucket.file("test.xlsx").download(options);

      const workbook = new ExcelJS.Workbook();
      const filename = "./test.xlsx";
      await workbook.xlsx.readFile(filename);
      const value = workbook.worksheets[0].getCell("A1").value;
  
      return res.json({bongs: 'BONG '.repeat(hours), time: date.getTime(), token: req.token, uid: uid, value: value});
    }).catch((error) => {
      // Handle error
      console.error(error.message);

      return res
        .status(401)
        .send({ error: 'You are not authorized to make this request!' });
    });

  });

exports.app = functions.https.onRequest(app);
