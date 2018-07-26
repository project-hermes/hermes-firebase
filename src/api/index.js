import isArray from 'lodash/isArray';
import isFinite from 'lodash/isFinite';
import {db} from '~/firebase';
import L from 'leaflet';
import firebase from 'firebase/app';

export function fetchDives({orderBy, limit, dateRange, coordinates} = {}) {
    let query = db.collection('Dive');

    query = orderBy
        ? query.orderBy(...(isArray(orderBy) ? orderBy : [orderBy]))
        : query;

    query = limit ? query.limit(limit) : query;

    if (hasDateRange(dateRange)) {
        const {from, to} = dateRange;
        query = query
            .where('timeStart', '>=', from)
            .where('timeStart', '<=', to);
    }

    if (hasCoordinates(coordinates)) {
        const {range, latitude, longitude} = coordinates;
        const latLngBounds = L.latLng(latitude, longitude).toBounds(
            range * 1000
        );
        const se = latLngBounds.getSouthEast();
        const nw = latLngBounds.getNorthWest();

        const nwGeoPoint = new firebase.firestore.GeoPoint(nw.lat, se.lng);
        const seGeoPoint = new firebase.firestore.GeoPoint(se.lat, nw.lng);
        query = query
            .where('coordinateStart', '<=', nwGeoPoint)
            .where('coordinateStart', '>=', seGeoPoint);
    }

    return query.get();
}

function hasDateRange(dateRange) {
    return !!(dateRange && dateRange.from && dateRange.to);
}

function hasCoordinates(coordinates) {
    return (
        !!coordinates &&
        isFinite(
            coordinates.range + coordinates.latitude + coordinates.longitude
        )
    );
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
