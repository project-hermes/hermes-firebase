import firebase from 'firebase/app';

export function signInWithEmailAndPassword(email, password) {
    return firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            return firebase.auth().signInWithEmailAndPassword(email, password);
        });
}

export function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase
        .auth()
        .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            return firebase.auth().signInWithPopup(provider);
        });
}

export function signOut() {
    return firebase.auth().signOut();
}

// TODO: displayName?
export function createUser({email, password}) {
    return firebase.auth().createUserWithEmailAndPassword(email, password);
}
