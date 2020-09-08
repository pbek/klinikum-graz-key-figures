<template>
  <v-container>
    <v-row>
      <v-card
        class="mx-auto"
        max-width="344"
        outlined
      >
        <v-list-item three-line>
          <v-list-item-content>
            <div class="overline mb-4">DATA</div>
            <v-list-item-title class="headline mb-1">Controlling</v-list-item-title>
            <v-list-item-subtitle>{{data}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
    
        <v-card-actions>
          <v-btn icon v-on:click="fetchData" title="Reload">
            <v-icon>mdi-cached</v-icon>
          </v-btn>
        </v-card-actions>
      </v-card>

    </v-row>
  </v-container>
</template>

<script>
  import firebase from "firebase";
  import Axios from "axios";

  export default {
    name: 'Controlling',
    data () {
        return {
            data: "",
        }
    },
    mounted() {
      const that = this;

      firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          // that.user = user;
          console.log("Want to fetch for: ", user);
          that.fetchData();
        } else {
          // that.user = null;
        }
      });
    },
    methods: {
      fetchData() {
        console.log("Fetching...");
        const that = this;
        this.data = "";

        firebase.auth().currentUser.getIdToken(true).then(function(idToken) {
          // Send token to your backend via HTTPS
          // ...
          console.log("idToken: " + idToken);

          const config = {
            headers: { Authorization: `Bearer ${idToken}` }
          };

          const url = "http://localhost:5000/api/data";
          // const url = "https://kages-controlling.web.app/api/data";

          Axios.get( 
            url,
            config
          ).then((res) => {
            console.log(res.data);
            that.data = res.data.value;
          }).catch(console.error);
        }).catch(function(error) {
          // Handle error
          console.error(error);
        });

      }
    }
  }
</script>