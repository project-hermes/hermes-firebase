import keys from 'lodash/keys';
import map from 'lodash/map';
import {fetchDive, listenForDives} from '~/api';

export default {
    namespaced: true,
    state: {
        map: {},
        dataMap: {},
        unsubscribe: null
    },
    mutations: {
        addDive(state, doc) {
            const docData = doc.data();
            docData.id = doc.id;
            state.map[doc.id] = docData;
            state.map = {...state.map};
        },
        removeDive(state, id) {
            delete state.map[id];
            state.map = {...state.map};
        },
        addBatch(state, docs) {
            docs.forEach(doc => {
                const docData = doc.data();
                docData.id = doc.id;
                state.map[doc.id] = docData;
            });
            state.map = {...state.map};
        },
        removeBatch(state, ids) {
            ids.forEach(id => {
                delete state.map[id];
            });
            state.map = {...state.map};
        },
        setUnsubscriber(state, unsubFn) {
            state.unsubscribe && state.unsubscribe();
            state.unsubscribe = unsubFn;
        },
        unsubscribe(state) {
            state.unsubscribe && state.unsubscribe();
            state.unsubscribe = null;
        },
        addDiveData(state, {id, data}) {
            state.dataMap = {
                ...state.dataMap,
                [id]: data
            };
        }
    },
    actions: {
        listenForDives({commit}) {
            const unsubscribe = listenForDives(snapshot => {
                const toAdd = [];
                const toRemove = [];
                snapshot.docChanges().forEach(({type, doc}) => {
                    switch (type) {
                        case 'added':
                        case 'changed':
                            toAdd.push(doc);
                            break;
                        case 'removed':
                            toRemove.push(doc.id);
                            break;
                    }
                });
                commit('addBatch', toAdd);
                commit('removeBatch', toRemove);
            });

            commit('setUnsubscriber', unsubscribe);
        },
        fetchDiveData({commit, getters}, id) {
            if (getters.getDiveDataById(id)) {
                return Promise.resolve(getters.getDiveDataById(id));
            }

            return fetchDive(id).then(snapshot => {
                const rows = [];
                snapshot.forEach(doc => {
                    rows.push(doc.data());
                });
                commit('addDiveData', {id, data: rows});
                return rows;
            });
        }
    },
    getters: {
        list(store) {
            const {map: diveMap} = store;
            return map(keys(diveMap), id => diveMap[id]);
        },
        getDiveById(state) {
            return id => state.map[id];
        },
        getDiveDataById(state) {
            return id => state.dataMap[id];
        }
    }
};
