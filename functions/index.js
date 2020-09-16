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

      // asyncArrayForEach(workbook.worksheets, (value) => {
      //   console.log(value);
      // })

      // const worksheets = workbook.worksheets;
      // console.log(worksheets.length);

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
          const date = row.getCell('E').value;
          // let dateTime = moment(date + ' ' + time, 'DD-MM-YYYY hh:mm');
          // if (!dateTime.isValid()) {
          //   dateTime = moment(date);
          // }
          // const timestamp = new admin.firestore.Timestamp(dateTime.unix(), 0);

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

const db = admin.firestore();

exports.importKeyFigures = functions.storage.object().onFinalize(async (object) => {
  const contentType = object.contentType; // File content type.
  const filePath = object.name;

  if (!contentType.startsWith('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    console.warning(filePath + ' is not an XLSX spreadsheet file!')

    return;
  }

  const fileBucket = object.bucket;
  const bucket = admin.storage().bucket(fileBucket);

  const stream = bucket.file(filePath).createReadStream()
  .on('error', (err) => {
      console.error(`Could not create stream for file '${filePath}': ${err.message}`);
  })
  .on('end', () => {
      // The file is fully downloaded.
      console.log(`Stream of '${filePath}' was read!`);
  });

  // open the file stream
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.read(stream);

  await asyncForEach(workbook.worksheets, async worksheet => {
  // await workbook.worksheets.forEach(async worksheet => {
  // asyncArrayForEach(workbook.worksheets, worksheet => {
  // const worksheets = await workbook.worksheets;
  // console.log(worksheets.length);
  // for (let index = 0; index < worksheets.length; index++) {
  //   const worksheet = worksheets[index];
    const worksheetName = worksheet.name;
    let importCount = 0;
    const timeCol = worksheet.getColumn('F');
    const batch = db.batch();
    // console.log(`Reading worksheet ${worksheetName}`);
    // let dataList = [];
    // accumulated data for one full day over all orgEntities
    let dataDay = {
      bedsFull: 0,
      bedsEmpty: 0,
      bedsTotal: 0,
      dateString: '',
    };
    let dateString = '';

    // beware of forEach in eachCell that doesn't work async!
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
      const orgEntity = row.getCell('A').value;
      const subOrgEntity = row.getCell('B').value;
      const subSubOrgEntity = row.getCell('C').value;
      let bedsFullValue = row.getCell('M').value;
      let bedsEmptyValue = row.getCell('N').value;
      const date = row.getCell('E').value;
      // usually the date in cell E is a string
      let dateTime = moment(date + ' ' + time, 'DD-MM-YYYY hh:mm');
      // sometimes the date in cell E is a datetime
      if (!dateTime.isValid()) {
        dateTime = moment(date);
      }
      // const timestamp = new admin.firestore.Timestamp(dateTime.unix(), 0);
      bedsFullValue = bedsFullValue.result || (Number.isInteger(bedsFullValue) ? bedsFullValue : 0);
      bedsEmptyValue = bedsEmptyValue.result || (Number.isInteger(bedsEmptyValue) ? bedsEmptyValue : 0);
      dateString = dateTime.format('YYYY-MM-DD').toString();
      const bedsTotalValue = bedsFullValue + bedsEmptyValue;

      const data = {
        orgEntity: orgEntity,
        subOrgEntity: subOrgEntity,
        subSubOrgEntity: subSubOrgEntity,
        bedsFull: bedsFullValue,
        bedsEmpty: bedsEmptyValue,
        bedsTotal: bedsTotalValue,
        // dateTime: timestamp,
        dateString: dateString,
        // created: admin.firestore.FieldValue.serverTimestamp()
      };

      // accumulate values for one whole day
      dataDay.bedsFull += bedsFullValue;
      dataDay.bedsEmpty += bedsEmptyValue;
      dataDay.bedsTotal += bedsTotalValue;
    
      // add KeyFigures document for one subSubOrgEntity for one day
      const docName = data.dateString + '-' + data.orgEntity + '-' + data.subOrgEntity + '-' + data.subSubOrgEntity;
      let docRef = db.collection('KeyFigures').doc(docName);
      batch.set(docRef, data);
      importCount++;

      // await db.collection('KeyFigures').doc(docName).set(data);
      // dataList.push(`${worksheetName} ${rowNumber}`);
      // dataList.push(data);
      // console.log(`Set worksheet ${worksheetName}, row ${rowNumber}`);
    });

    // console.log(`Imported worksheet ${worksheetName} of '${filePath}' with ${importCount} key figures`);
    // console.log(dataList.length, dataList);

    // for (let index = 0; index < dataList.length; index++) {
    //   const data = dataList[index];
    //   const docName = data.dateString + '-' + data.orgEntity + '-' + data.subOrgEntity + '-' + data.subSubOrgEntity;
    //   // await db.collection('KeyFigures').doc(docName).set(data);
    //   let docRef = db.collection('KeyFigures').doc(docName);
    //   batch.set(docRef, data);
    // }
  
    // await batch.commit().then(() => {
    //   return console.log(`Imported worksheet ${worksheetName} of '${filePath}' with ${importCount} key figures`);
    // }).catch((e) => {
    //   return console.error(e);
    // });

    // commit batch of KeyFigures documents for one day
    await batch.commit();

    // commit DayKeyFigures document for one day
    const docName = dateString;
    dataDay.dateString = dateString;
    await db.collection('DayKeyFigures').doc(docName).set(dataDay);

    console.log(`Imported worksheet ${worksheetName} of '${filePath}' with ${importCount} key figures`);
  });
});

// async function asyncArrayForEach(array, callback) {
//   for (let index = 0; index < array.length; index++) {
//       await callback(array[index], index, array);
//   }
// }

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
