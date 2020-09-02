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
    apiKey: "AIzaSyBTvL644E8wvtAFm3Y0jIGr-TRr_Ocvno0",
    authDomain: "kages-controlling.firebaseapp.com",
    databaseURL: "https://kages-controlling.firebaseio.com",
    projectId: "kages-controlling",
    storageBucket: "kages-controlling.appspot.com",
    messagingSenderId: "633774730098",
    appId: "1:633774730098:web:b75243d60b5aef9a798beb"
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