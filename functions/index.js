const functions = require('firebase-functions');
const admin = require('firebase-admin');
const atob = require('atob');
var moment = require('moment');
admin.initializeApp(functions.config().firebase);

exports.helloPubSub = functions.pubsub.topic('test').onPublish((event) => {
    var db = admin.firestore();
    var now = moment().unix();
    const pubSubMessage = event.data;
    try {
        let data = atob(pubSubMessage.data);
        let splitData = data.split(' ');
        console.log(splitData);
        db.collection('hermes1').add({
                time: parseInt(splitData[0]),
                temperature: parseInt(splitData[1]),
                depth: parseInt(splitData[2])
            })
            .then((docRef) => {
                console.log("Document written with ID: ", docRef.id);
                return docRef.id;
            })
            .catch((error) => {
                console.error("Error adding document: ", error);
            });
    } catch (e) {
        console.error('PubSub message error', e);
        return 1;
    }
    return 0;
});