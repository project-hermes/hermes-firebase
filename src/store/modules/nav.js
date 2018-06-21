export default {
    namespaced: true,
    state: {
        isToggled: false
    },
    mutations: {
        setToggle(state, isToggled) {
            state.isToggled = !!isToggled;
        }
    },
    actions: {
        toggle({commit, getters}) {
            commit('setToggle', !getters.isToggled);
        },
        toggleOff({commit}) {
            commit('setToggle', false);
        }
    },
    getters: {
        isToggled(store) {
            return store.isToggled;
        }
    }
};
