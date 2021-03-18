// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';
import request from './assets/request'
const axi = axios.create({
  headers: {
    "content-type": "multipart/form-data"
  }
})
Vue.use(ElementUI);
Vue.config.productionTip = false
Vue.prototype.$axios = request
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
