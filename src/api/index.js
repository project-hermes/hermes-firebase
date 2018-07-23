import isArray from 'lodash/isArray';
import {db} from '~/firebase';

export function fetchDives({orderBy, limit, from, to} = {}) {
    let query = db.collection('Dive');

    query = orderBy
        ? query.orderBy(...(isArray(orderBy) ? orderBy : [orderBy]))
        : query;

    query = limit ? query.limit(limit) : query;

    if (from && to) {
        query = query.where('timeStart', '>', from).where('timeStart', '<', to);
    }

    return query.get();
}

export function fetchDiveData(id) {
    return db
        .doc(`Dive/${id}`)
        .collection('data')
        .orderBy('timestamp')
        .get();
}

export function fetchDive(id) {
    return db.doc(`Dive/${id}`).get();
}

export function listenForDives(cb) {
    return db.collection('Dive').onSnapshot(cb);
}
