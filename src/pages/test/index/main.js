/**
 *  2019/7/22  lize
 */
import Vue from 'vue';

import router from './router';

import store from './store';

import Http from '@/common/assets/js/http.js';

import SV from '@/common/assets/js/publicValue.js'

import App from './App.vue';

Vue.use(Http); // 用法  this.$Http.post() or this.$Http.get() 等等  详情请看 @/common/assets/js/http.js
// Vue.prototype.$Http = Http; // 用法  this.$Http.post() or this.$Http.get() 等等  详情请看 @/common/assets/js/http.js

Vue.use(SV);

Vue.config.productionTip = false;

new Vue({
  
  router,
  
  store,
  
  render: h => h(App),
  
}).$mount('#app');
