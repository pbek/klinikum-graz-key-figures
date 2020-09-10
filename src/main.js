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
    apiKey: process.env.VUE_APP_FIREBASE_API_KEY,
    authDomain: process.env.VUE_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: "https://kages-controlling.firebaseio.com",
    projectId: process.env.VUE_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VUE_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: "633774730098",
    appId: process.env.VUE_APP_FIREBASE_APP_ID
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