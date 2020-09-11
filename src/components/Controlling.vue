<template>
  <v-container>
    <!-- <v-row>
      <v-card-actions>
        <v-btn icon v-on:click="fetchData" title="Reload">
          <v-icon>mdi-cached</v-icon>
        </v-btn>
      </v-card-actions>
    </v-row> -->
    <v-row>
      <v-progress-linear
        v-if="!data"
        indeterminate
      ></v-progress-linear>
      <template v-for="dateBlock in data.stats">
        <v-col
                v-for="timeBlock in dateBlock.timesData"
                :key="timeBlock.dateTime"
                cols="12"
                sm="6"
                md="4"
                lg="3"
              >
          <v-card>
            <v-card-title class="subheading font-weight-bold">{{ dateBlock.date }} {{ timeBlock.time }}</v-card-title>

            <v-divider></v-divider>

            <v-list dense>
              <v-list-item>
                <v-list-item-content>Betten belegt</v-list-item-content>
                <v-list-item-content class="align-end">{{ timeBlock.bedsFull }}</v-list-item-content>
              </v-list-item>

              <v-list-item>
                <v-list-item-content>Betten frei</v-list-item-content>
                <v-list-item-content class="align-end">{{ timeBlock.bedsEmpty }}</v-list-item-content>
              </v-list-item>

              <v-list-item class="small">
                <v-list-item-content>Tats. Betten Gesamt</v-list-item-content>
                <v-list-item-content class="align-end">{{ timeBlock.bedsFull + timeBlock.bedsEmpty }}</v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </template>
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
            data: false,
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

          // const url = "http://localhost:5000/api/data";
          // const url = "https://kages-controlling.web.app/api/data";
          const url = process.env.VUE_APP_API_URL;

          Axios.get( 
            url,
            config
          ).then((res) => {
            console.log(res.data);
            that.data = res.data;
          }).catch(console.error);
        }).catch(function(error) {
          // Handle error
          console.error(error);
        });

      }
    }
  }
</script>
<style scoped>
  .small {
    font-size: 0.8em;
  }
</style>