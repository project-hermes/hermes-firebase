import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import enLocale from 'element-ui/lib/locale/lang/en'
import {firebaseInit} from './firebase';
import 'element-ui/lib/theme-chalk/index.css';
import 'leaflet/dist/leaflet.css';

Vue.use(ElementUI, {locale: enLocale});
new Vue({
  el: '#app',
  render: h => h(App)
});
