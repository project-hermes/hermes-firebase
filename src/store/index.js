import Vue from 'vue';
import Vuex from 'vuex';
import {dives, nav} from './modules';
Vue.use(Vuex);

export default new Vuex.Store({
    strict: true,
    modules: {
        dives,
        nav
    }
});
