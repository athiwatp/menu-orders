import Vue from 'vue'
import VueFire from 'vuefire'
import App from './App'
import VueSweetAlert from 'vue-sweetalert'

Vue.use(VueSweetAlert)
Vue.use(VueFire)

/* eslint-disable no-new */
new Vue({
  el: 'body',
  components: { App }
})
