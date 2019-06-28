// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import Mint from 'mint-ui'
import store from './store'
import { Navbar, TabItem, Toast, Spinner, Range, Popup, Picker} from 'mint-ui'
// import router from './router'
import axios from 'axios'
import $ from './util.js'
import 'font-awesome/css/font-awesome.min.css'
import 'mint-ui/lib/style.css'
Vue.prototype.$axios = axios;
Vue.prototype.$ = $;
import qs from 'qs';
Vue.prototype.qs = qs.stringify;
Vue.$toast = Vue.prototype.$toast = Toast;

Vue.config.productionTip = false
Vue.component(Navbar.name, Navbar);
Vue.component(TabItem.name, TabItem);
Vue.component(Spinner.name, Spinner);
Vue.component(Range.name, Range);
Vue.component(Popup.name, Popup);
Vue.component(Picker.name, Picker);
Vue.use(Mint);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { App },
  template: '<App/>'
})
