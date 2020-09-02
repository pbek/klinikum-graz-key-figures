import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import firebase from 'firebase'
import './registerServiceWorker'

Vue.config.productionTip = false

// new Vue({
//   vuetify,
//   render: h => h(App)
// }).$mount('#app')

const firebaseConfig = {
  };
  
firebase.initializeApp(firebaseConfig);

new Vue({
    // el: '#app',
    vuetify,
    render: h => h(App),
    props: {
      source: String,
    },
  
    data: () => ({
      drawer: null,
    }),
  
    created () {
      this.$vuetify.theme.dark = true
    },
  }).$mount('#app')