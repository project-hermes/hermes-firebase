import config from './firebase-config';
import firebase from 'firebase/app';
import 'firebase/firestore';

firebase.initializeApp(config);

export const db = firebase.firestore();
const settings = {
    timestampsInSnapshots: true
};
db.settings(settings);
