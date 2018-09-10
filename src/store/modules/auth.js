import {
    signInWithEmailAndPassword,
    signInWithGoogle,
    signOut,
    createUser
} from '~/api/auth';
import router from '~/router';
let resolve;
const readyPromise = new Promise(res => {
    resolve = res;
});

export default {
    namespaced: true,
    state: {
        user: null,
        readyPromise
    },
    mutations: {
        setUser(store, user) {
            store.user = user;
        }
    },
    actions: {
        appReady() {
            if (resolve) {
                resolve(true);
                resolve = null;
            }
        },
        userChanged({commit}, user) {
            commit('setUser', user);
        },
        signOut() {
            signOut();
        },
        signInWithEmailAndPassword(_, {email, password}) {
            return signInWithEmailAndPassword(email, password);
        },
        signInWithGoogle() {
            return signInWithGoogle();
        },
        signUp() {
            router.push({name: 'signUp'});
        },
        createUser(_, params) {
            return createUser(params);
        }
    },
    getters: {
        user(store) {
            return store.user;
        },
        isAuthorized(store) {
            return !!store.user;
        },
        isReady(store) {
            return store.showApp;
        },
        readyPromise(store) {
            return store.readyPromise;
        }
    }
};
