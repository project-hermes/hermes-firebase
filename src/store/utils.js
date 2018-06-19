import camelCase from 'lodash/camelCase';

export const createAsyncMutation = type => ({
    SUCCESS: `${type}_SUCCESS`,
    FAILURE: `${type}_FAILURE`,
    PENDING: `${type}_PENDING`,
    loadingKey: camelCase(`${type}_PENDING`),
    stateKey: camelCase(`${type}_DATA`)
});

export const doAsync = (store, {request, mutationTypes}) => {
    store.commit(mutationTypes.PENDING);
    request()
        .then(response => {
            store.commit(mutationTypes.SUCCESS, response.data);
        })
        .catch(() => {
            store.commit(mutationTypes.FAILURE);
        });
};
