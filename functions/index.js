const functions = require('firebase-functions');
const admin = require('firebase-admin');
const atob = require('atob');
var moment = require('moment');
admin.initializeApp(functions.config().firebase);

exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello from Firebase!");
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