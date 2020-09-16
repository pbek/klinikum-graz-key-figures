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
        v-if="!stats"
        indeterminate
      ></v-progress-linear>
      <template v-if="stats">
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
        <v-col cols="12">
          <v-card>
            <v-card-title class="subheading font-weight-bold">
              Belegung um 7:00
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
                  <tr v-for="(dateBlock, date) in stats" v-bind:key="date">
                    <td>{{ dateBlock.dateFormatted }}</td>
                    <td>{{ dateBlock.bedsFull }}</td>
                    <td>{{ dateBlock.bedsEmpty }}</td>
                    <td class="gray">{{ dateBlock.bedsTotal }}</td>
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
  import moment from "moment";
  import * as utils from "../utils";

  export default {
    name: 'Controlling',
    data () {
        return {
            stats: false,
            dates: [],
            percentages: [],
            filter1: utils.getFilter1Mapping(),
            filterValue1: "",
            filter2: [],
            filterValue2: "",
        }
    },
    watch: {
      filterValue1(val) {
        // val is undefined if filter 1 isn't selected
        this.filter2 = utils.getFilter2Mapping(val);
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
      async fetchData() {
        console.log("Fetching...");
        let statData = {};
        this.stats = "";
        this.dates = [];
        this.percentages = [];
        const that = this;
        const db = firebase.firestore();
        const keyFiguresRef = db.collection("DayKeyFigures");
        let dayOffset = 0;
        let maxDayOffset = 5; // only allow a maximum of 5 days to be found

        do {
          let date = moment();
          date = date.subtract(dayOffset, "days");
          const dateString = date.format("YYYY-MM-DD");
          let foundDay = false;

          await keyFiguresRef.where("dateString", "==", dateString).get().then((querySnapshot) => {
            // there should only be one doc for that day
            querySnapshot.forEach((doc) => {
              if (!foundDay) {
                maxDayOffset--;
                foundDay = true;
              }

              // if (statData[dateString] === undefined) {
              //   statData[dateString] = {
              //     "date": date,
              //     "dateFormatted": date.format("DD.MM"),
              //     "bedsFull": 0,
              //     "bedsEmpty": 0,
              //     "bedsTotal": 0
              //   };
              // }

              const data = doc.data();
              // statData[dateString].bedsFull += data.bedsFull;
              // statData[dateString].bedsEmpty += data.bedsEmpty;
              // statData[dateString].bedsTotal += data.bedsTotal;

              const dateFormatted = date.format("DD.MM");
              const bedsPercent = data.bedsFull * 100 / data.bedsTotal;
              statData[dateString] = {
                "date": date,
                "dateFormatted": dateFormatted,
                "bedsFull": data.bedsFull,
                "bedsEmpty": data.bedsEmpty,
                "bedsTotal": data.bedsTotal,
                "bedsPercent": bedsPercent
              }

              that.dates.push(dateFormatted);
              that.percentages.push(bedsPercent);
            });
          });

          // if (statData[dateString] !== undefined) {
          //   statData[dateString].bedsPercent = statData[dateString].bedsFull * 100 / statData[dateString].bedsTotal;
          //   that.dates.push(statData[dateString].dateFormatted);
          //   that.percentages.push(statData[dateString].bedsPercent);
          // }

          dayOffset++;
        } while (maxDayOffset > 0 && dayOffset < 100);

        console.log(statData);
        this.stats = statData;
        this.dates.reverse();
        this.percentages.reverse();
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