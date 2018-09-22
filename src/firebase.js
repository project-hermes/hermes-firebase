import get from 'lodash/get';

import config from './firebase-config';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

import store from '~/store';
import router from '~/router';

firebase.initializeApp(config);

export const db = firebase.firestore();
const settings = {
    timestampsInSnapshots: true
};
db.settings(settings);

export default firebase;

firebase.auth().onAuthStateChanged(user => {
    const currentUser = store.getters['auth/user'];
    store.dispatch('auth/appReady');
    if (user) {
        const {
            displayName,
            email,
            emailVerified,
            uid,
            photoURL,
            isAnonymous
        } = user;
        store.dispatch('auth/userChanged', {
            displayName,
            email,
            emailVerified,
            uid,
            photoURL,
            isAnonymous
        });
    } else {
        store.dispatch('auth/userChanged', null);
    }

    const pendingRoute = get(router, ['history', 'pending']);
    if (
        (pendingRoute === null || get(pendingRoute, 'name') === 'signIn') &&
        isLoggingIn(currentUser, user)
    ) {
        router.push('/');
    } else if (isLoggingOut(currentUser, user)) {
        router.push('/sign-in');
    }
});

function isLoggingIn(oldUser, newUser) {
    return !oldUser && !!newUser;
}

function isLoggingOut(oldUser, newUser) {
    return !!oldUser && !newUser;
}
