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
        <v-col cols="6">
          <v-autocomplete
            label="Klinik"
            v-model="filterValue1"
            :items="filter1"
            clearable
          ></v-autocomplete>
        </v-col>
        <v-col cols="6">
          <v-autocomplete
            label="Klinische Abteilung"
            :value="filterValue2"
            :items="filter2"
            clearable
          ></v-autocomplete>
        </v-col>
        <v-col
                v-for="timeBlock in data.stats[Object.keys(data.stats)[0]].timesData"
                :key="timeBlock.dateTime"
                cols="12"
              >
          <v-card>
            <v-card-title class="subheading font-weight-bold">
              Belegung um {{ timeBlock.time }}
            </v-card-title>

            <v-divider></v-divider>

            <v-simple-table dense>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th></th>
                    <th class="text-left">Betten belegt</th>
                    <th class="text-left">Betten frei</th>
                    <th class="text-left gray">Tats. Betten Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(dateBlock, date) in data.stats" v-bind:key="date">
                    <td>{{ dateBlock.date }}</td>
                    <td>{{ dateBlock.timesData['07:00'].bedsFull }}</td>
                    <td>{{ dateBlock.timesData['07:00'].bedsEmpty }}</td>
                    <td class="gray">{{ dateBlock.timesData['07:00'].bedsFull + dateBlock.timesData['07:00'].bedsEmpty }}</td>
                  </tr>
                </tbody>
              </template>
              </v-simple-table>
              <v-row align="center" justify="center">
                <v-col cols="12" style="max-width: 420px">
                  <v-sparkline
                    :labels="dates"
                    :value="percentages"
                    color="rgba(255, 255, 255, .7)"
                    stroke-linecap="round"
                    smooth
                    auto-draw
                    :gradient="['#f72047', '#ffd200', '#1feaea']"
                  >
                </v-sparkline>
              </v-col>
            </v-row>
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
            dates: [],
            percentages: [],
            filter1: [
              {"text" :"OE Fach 1", "value": "OE1"},
              {"text" :"OE Fach 2", "value": "OE2"},
            ],
            filterValue1: "",
            filter2: [],
            filterValue2: "",
        }
    },
    watch: {
      filterValue1(val) {
        if (val === "OE1") {
          this.filter2 = [
              {"text" :"OE Sub Fach 1a", "value": "OE1a"},
              {"text" :"OE Sub Fach 1b", "value": "OE1b"},
            ]
        } else if (val === "OE2") {
          this.filter2 = [
              {"text" :"OE Sub Fach 2a", "value": "OE2a"},
              {"text" :"OE Sub Fach 2b", "value": "OE2b"},
            ]
        } else {
          this.filter2 = []
        }

        this.filterValue2 = "";
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
            const stats = that.data.stats;
            that.dates = [];
            that.percentages = [];

            for (let date in stats) {
              that.dates.push(date);
              const bedsFull = stats[date].timesData['07:00'].bedsFull;
              const bedsEmpty = stats[date].timesData['07:00'].bedsEmpty;
              const bedsTotal = bedsFull + bedsEmpty;
              that.percentages.push(bedsFull * 100 / bedsTotal);
            }

            that.dates.reverse();
            that.percentages.reverse();
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
  .small,
  .v-data-table > .v-data-table__wrapper > table > tbody > tr.small > td,
  .v-data-table > .v-data-table__wrapper > table > tbody > tr > td.small {
    font-size: 0.8em;
  }

  .gray, .theme--dark.v-data-table > .v-data-table__wrapper > table > thead > tr > th.gray {
    color: gray;
  }
</style>