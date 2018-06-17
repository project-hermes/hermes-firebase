import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './App.vue';
import {Dives} from '~/pages';
import './firebase';
import 'element-ui/lib/theme-chalk/index.css';
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});
import 'leaflet/dist/leaflet.css';

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

new Vue({
    router,
    render: createEle => createEle(App)
}).$mount('#app');
