import {db} from '~/firebase';

export function fetchDives() {
    return db.collection('Dive').get();
}

export function fetchDive(id) {
    return db
        .doc(`Dive/${id}`)
        .collection('data')
        .orderBy('timestamp')
        .get();
}

export function listenForDives(cb) {
    return db.collection('Dive').onSnapshot(cb);
}
