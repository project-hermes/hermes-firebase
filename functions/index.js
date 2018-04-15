const functions = require('firebase-functions');
const admin = require('firebase-admin');
const atob = require('atob');
var moment = require('moment');
admin.initializeApp(functions.config().firebase);

exports.testDarkSky = functions.https.onRequest((request, response) => {
  var data;
  req('https://api.darksky.net/forecast/0572265ceb918ccb26859277f09bde18/35.777489, -78.633157,255657600', (error, resp, body) => {
    console.log('error:', error);
    console.log('statusCode:', resp && resp.statusCode);
    data = JSON.parse(body);
  });
  return 0;
});


exports.helloPubSub = functions.pubsub.topic('test').onPublish((event) => {
    var db = admin.firestore();
    var now = moment().unix();
    var docRef = db.collection('hermes1').doc(now.toString());
    const pubSubMessage = event.data;
    try {
        let data = atob(pubSubMessage.data);
        console.log(data);
        docRef.set({
            'data': data
        });
    } catch (e) {
        console.error('PubSub message error', e);
        return 1;
    }
    return 0;
});

exports.dataInjestion = functions.pubsub.topic('test-hermes2').onPublish((event) => {
  console.log(atob(event.data.data));
  return 0;
});



exports.diveCreate = functions.pubsub.topic('diveCreate').onPublish((event) => {
  console.log('Creating dive');
  let db = admin.firestore();
  let sensorId = event.data.attributes.device_id;
  let rawData = String(atob(event.data.data));
  console.log(`Raw Data: ${rawData}`);
  let diveData = rawData.substring(1).split(" ").map(item => {
    return parseInt(item, 10);
  });

  let dive = {
    sensorId: sensorId,
    version: rawData.substring(0,1),
    coordinateStart: new admin.firestore.GeoPoint(diveData[0], diveData[1]),
    coordinateEnd: new admin.firestore.GeoPoint(diveData[2], diveData[3]),
    dataCount: diveData[4],
    timeStart: new Date(diveData[5]),
    timeEnd: new Date(diveData[6])
  };

  db.collection('Dives').add(dive).then(ref => {
    console.log(`Dive ${ref.id} written`);
    return 0;
  }).catch(error => {
    console.error(`Error creating dive with error ${error}`);
    return -1;
  });

  return 0;
});

exports.diveAppend = functions.pubsub.topic('diveAppend').onPublish((event) => {
  console.log('Appending dive');
  return 0;
});

exports.diveDone = functions.pubsub.topic('diveDone').onPublish((event) => {
  console.log('Closing out dive');
  return 0;
});
