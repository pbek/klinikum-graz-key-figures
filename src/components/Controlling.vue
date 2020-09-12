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
      <template v-if="data">
        <v-col
                v-for="timeBlock in data.stats[Object.keys(data.stats)[0]].timesData"
                :key="timeBlock.dateTime"
                cols="12"
              >
          <v-card>
            <v-card-title class="subheading font-weight-bold">
              {{ data.stats[Object.keys(data.stats)[0]].date }} {{ timeBlock.time }} | Belegung
            </v-card-title>

            <v-divider></v-divider>

            <v-simple-table dense>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th></th>
                    <th v-for="(dateBlock, date) in data.stats" v-bind:key="date" class="text-left">{{ dateBlock.date }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Betten belegt</td>
                    <td v-for="(dateBlock, date) in data.stats" v-bind:key="date">
                      {{ dateBlock.timesData['07:00'].bedsFull }}
                    </td>
                  </tr>
                  <tr>
                    <td>Betten frei</td>
                    <td v-for="(dateBlock, date) in data.stats" v-bind:key="date">
                      {{ dateBlock.timesData['07:00'].bedsEmpty }}
                    </td>
                  </tr>
                  <tr class="small">
                    <td>Tats. Betten Gesamt</td>
                    <td v-for="(dateBlock, date) in data.stats" v-bind:key="date">
                      {{ dateBlock.timesData['07:00'].bedsFull + dateBlock.timesData['07:00'].bedsEmpty }}
                    </td>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
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
  .small, .v-data-table > .v-data-table__wrapper > table > tbody > tr.small > td {
    font-size: 0.8em;
  }
</style>