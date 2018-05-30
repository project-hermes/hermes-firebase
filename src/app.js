import Vue from 'vue';
import App from './App.vue';
import enLocale from 'element-ui/lib/locale/lang/en';
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

import {
    Container,
    Header,
    Aside,
    Main,
    Row,
    Col,
    Card,
    Table,
    TableColumn
} from 'element-ui';

Vue.use(Container);
Vue.use(Header);
Vue.use(Aside);
Vue.use(Main);
Vue.use(Row);
Vue.use(Col);
Vue.use(Card);
Vue.use(Table);
Vue.use(TableColumn);

Vue.prototype.$ELEMENT = {locale: enLocale};
new Vue({
    el: '#app',
    render: h => h(App)
});
