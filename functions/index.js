const functions = require('firebase-functions');
const admin = require('firebase-admin');
const atob = require('atob');
const req = require('request');
admin.initializeApp(functions.config().firebase);

exports.weatherGet = functions.firestore.document('Dive/{diveId}').onCreate((snap, context) => {
  let time = snap.data.data().timeStart;
  let lat = snap.data.data().coordinateStart.latitude;
  let lon = snap.data.data().coordinateStart.longitude;
  req(`https://api.darksky.net/forecast/0572265ceb918ccb26859277f09bde18/${lat},${lon},${time}`, (error, response, body)=>{
    if(error){
      console.error(`Could not get weather data with error ${error}`);
      return -1;
    }
    console.log(snap.data.id);
    console.log(`${lat},${lon},${time}`);
    console.log(body);
    return 0;
  });

  return 0;
});

exports.sensorCreate = functions.pubsub.topic('sensorCreate').onPublish((event) =>{
  console.log('Registering sensor');
  let db = admin.firestore();
  let sensorId = event.data.attributes.device_id;
  let rawData = String(atob(event.data.data));
  console.log(`Raw Data: ${rawData}`);

  let sensor = {
    version: rawData.substring(0,1),
    lastUpdated: new Date()

  };

  db.collection('Sensor').doc(sensorId).set(sensor).then(()=>{
    console.log(`Created sensor ${sensorId}`);
    return 0;
  }).catch(error=>{
    console.error(`Could not create sensor ${sensorId} with error ${error}`);
    return -1;
  });

  return 0;
});

exports.diveCreate = functions.pubsub.topic('diveCreate').onPublish((event) => {
  console.log('Creating dive');
  let db = admin.firestore();
  let rawData = String(atob(event.data));
  let sensorId = event.attributes.device_id;
  let diveData = rawData.split(" ");

  let dive = {
    version: diveData[0],
    sensorId: sensorId,
    sensorDiveId: diveData[1],
    createdAt: new Date(),
    coordinateStart: new admin.firestore.GeoPoint(parseFloat(diveData[2]), parseFloat(diveData[3])),
    coordinateEnd: new admin.firestore.GeoPoint(parseFloat(diveData[4]), parseFloat(diveData[5])),
    sampleCount: parseInt(diveData[6]),
    timeStart: new Date(parseInt(diveData[7])*1000),
    timeEnd: new Date(parseInt(diveData[8])*1000)
  };

  db.collection('Dive').add(dive).then(ref => {
    console.log(`Dive ${ref.id} written`);
    return 0;
  }).catch(error => {
    console.error(`Error creating dive with error ${error} raw data ${event.data} attributes ${event.attributes.toString()}`);
    return -1;
  });

  return 0;
});

exports.diveAppend = functions.pubsub.topic('diveAppend').onPublish((event) => {
  console.log('Appending dive');
  let db = admin.firestore();
  let sensorId = event.data.attributes.device_id;
  let rawData = String(atob(event.data.data));
  console.log(`Raw Data: ${rawData}`);

  return 0;
});

exports.diveDone = functions.pubsub.topic('diveDone').onPublish((event) => {
  console.log('Closing out dive');
  let db = admin.firestore();
  let sensorId = event.data.attributes.device_id;
  let rawData = String(atob(event.data.data));
  console.log(`Raw Data: ${rawData}`);

  return 0;
});

exports.escapeHatch = functions.https.onRequest((req, res) => {
  res.status(200);
});
