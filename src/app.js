import Vue from 'vue';
import router from '~/router';
import store from '~/store';
import App from './App.vue';
import './firebase';
import 'element-ui/lib/theme-chalk/index.css';
import L from 'leaflet';
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/style.css';

import {DatePicker, Loading} from 'element-ui';

Vue.use(DatePicker);
Vue.use(Loading);

locale.use(lang);
Vue.prototype.$ELEMENT = {locale};

new Vue({
    router,
    store,
    render: createEle => createEle(App)
}).$mount('#app');
