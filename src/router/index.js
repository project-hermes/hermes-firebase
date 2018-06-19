import Vue from 'vue';
import VueRouter from 'vue-router';
import {Dives} from '~/pages';
Vue.use(VueRouter);
const router = new VueRouter({
    mode: 'history',
    routes: [
        {path: '/', redirect: '/dives'},
        {
            path: '/dives',
            component: Dives
        }
    ]
});

export default router;
