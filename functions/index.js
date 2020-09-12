const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const moment = require('moment');
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
    origin: ['http://localhost:8080', 'http://localhost:8081', 'https://kages-controlling.web.app', 'https://kages-controlling-dev.web.app', 'http://localhost:5000'],
    allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Methods", "Access-Control-Request-Headers"],
    credentials: true,
    enablePreflight: true
}

app.use(cors(corsOptions));
app.use(bearerToken());
app.options('*', cors(corsOptions));
const config = JSON.parse(process.env.FIREBASE_CONFIG);
admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    storageBucket: config.storageBucket
});
const bucket = admin.storage().bucket();

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
      // const value = workbook.worksheets[0].getCell("A1").value;

      let resultData = {stats: {}};

      workbook.worksheets.reverse().forEach(worksheet => {
        let times = [];
        let timesData = {};
        const timeCol = worksheet.getColumn('F');

        timeCol.eachCell((cell, rowNumber) => {
          if (rowNumber === 1) {
            return;
          }

          // 1899-12-30T19:00:00.000Z
          const time = moment(cell.value).format("HH:mm").toString();

          // only need 7:00 right now
          if (time !== '07:00') {
            return;
          }

          const row = worksheet.getRow(rowNumber);
          const bedsFullValue = row.getCell('M').value;
          const bedsEmptyValue = row.getCell('N').value;

          if (timesData[time] === undefined) {
            timesData[time] = {dateTime: worksheet.name + ' ' + time, time: time, bedsFull: 0, bedsEmpty: 0};
          }

          timesData[time]['bedsFull'] += bedsFullValue.result || (Number.isInteger(bedsFullValue) ? bedsFullValue : 0);
          timesData[time]['bedsEmpty'] += bedsEmptyValue.result || (Number.isInteger(bedsEmptyValue) ? bedsEmptyValue : 0);

          if (times.indexOf(time) === -1) {
            times.push(time);
          }
        });

        resultData.stats[worksheet.name] = {date: worksheet.name, times: times, timesData: timesData};
      });
  
      return res.json(resultData);
      // return res.json({bongs: 'BONG '.repeat(hours), time: date.getTime(), token: req.token, uid: uid, value: value, test: {test: 123}});
    }).catch((error) => {
      // Handle error
      console.error(error.message);

      return res
        .status(401)
        .send({ error: 'You are not authorized to make this request: ' + error.message });
    });

  });

exports.app = functions.https.onRequest(app);
