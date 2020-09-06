<template>
  <v-app id="inspire">
    <v-app id="inspire">
      <v-navigation-drawer
        v-model="drawer"
        app
        clipped
      >
        <v-list dense>
          <v-list-item link v-if="user !== null" @click="logout">
            <v-list-item-action>
              <v-icon>mdi-logout</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>Logout {{user.email}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>

      <v-app-bar
        app
        clipped-left
      >
        <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title>Application</v-toolbar-title>
      </v-app-bar>

      <v-main>
        <v-container
          class="fill-height"
          fluid
        >
          <v-row
            align="center"
            justify="center"
          >
            <Login v-if="user === null"></Login>
            <Controlling v-else></Controlling>
          </v-row>
        </v-container>
      </v-main>

      <v-footer app>
        <span>&copy; {{ new Date().getFullYear() }}</span>
      </v-footer>
    </v-app>
  </v-app>
</template>
<script>
import Login from './components/Login';
import Controlling from './components/Controlling';
import firebase from "firebase";

export default {
  name: 'App',

  components: {
    Login,
    Controlling,
  },

  data: () => ({
    drawer: null,
    user: null,
  }),

  mounted() {
    const that = this;

    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        console.log("currentUser: ", firebase.auth().currentUser);
        that.user = firebase.auth().currentUser;
      })
      .catch(function(error) {
        // Handle Errors here.
        console.error(error.message);
      });

    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        that.user = user;
        console.log("main user changed: ", user);
      } else {
        that.user = null;
      }
    });
  },

  methods: {
    logout() {
      firebase.auth().signOut().then(function() {
        // Sign-out successful.
      }, function(error) {
        // An error happened.
        console.error(error.message);
      });
    }
  }
};
</script>
