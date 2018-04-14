const functions = require('firebase-functions');
const admin = require('firebase-admin');
const atob = require('atob');
var moment = require('moment');
admin.initializeApp(functions.config().firebase);

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

exports.testDarkSky = functions.https.onRequest((request, response) => {
  var data;
  req('https://api.darksky.net/forecast/0572265ceb918ccb26859277f09bde18/35.777489, -78.633157,255657600', (error, resp, body) => {
    console.log('error:', error);
    console.log('statusCode:', resp && resp.statusCode);
    data = JSON.parse(body);
  });
  response.send(data);
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
  console.log(event.data);
  return 0;
});
