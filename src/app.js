import Vue from 'vue';
import App from './App.vue';
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

new Vue({
    el: '#app',
    render: h => h(App)
});
