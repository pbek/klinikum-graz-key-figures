<template>
  <v-container>
    <!-- <v-row>
      <v-card-actions>
        <v-btn icon v-on:click="fetchData" title="Reload">
          <v-icon>mdi-cached</v-icon>
        </v-btn>
      </v-card-actions>
    </v-row> -->
    <v-skeleton-loader
          :loading="!stats"
          type="list-item,card@2"
        >
      <v-row>
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
            v-model="filterValue2"
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
                    :value="occupancyPercentages"
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
        <v-col cols="12">
          <v-card>
            <v-card-title class="subheading font-weight-bold">
              Aufnahmen
            </v-card-title>

            <v-divider></v-divider>

            <v-simple-table dense>
              <template v-slot:default>
                <thead>
                  <tr>
                    <th></th>
                    <th class="text-left">Aufnahmen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(dateBlock, date) in stats" v-bind:key="date">
                    <td>{{ dateBlock.dateFormatted }}</td>
                    <td>{{ dateBlock.admissions }}</td>
                  </tr>
                </tbody>
              </template>
              </v-simple-table>
              <v-row align="center" justify="center">
                <v-col cols="12" style="max-width: 420px">
                  <v-sparkline
                    :labels="dates"
                    :value="admissionsItems"
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
      </v-row>
    </v-skeleton-loader>
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
            occupancyPercentages: [],
            admissionsItems: [],
            filter1: utils.getFilter1Mapping(),
            filterValue1: undefined,
            filter2: [],
            filterValue2: undefined,
        }
    },
    watch: {
      filterValue1(val) {
        // val is undefined if filter 1 isn't selected
        this.filter2 = utils.getFilter2Mapping(val);

        if (this.filterValue2 !== undefined) {
          this.filterValue2 = undefined;
        } else {
          this.fetchData();
        }
      },
      filterValue2() {
        this.fetchData();
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
        const that = this;
        console.log(`Fetching for ${that.filterValue1}-${that.filterValue2}...`);
        let statData = {};
        this.stats = "";
        this.dates = [];
        this.occupancyPercentages = [];
        this.admissionsItems = [];
        const db = firebase.firestore();
        const hasFilter1 = that.filterValue1 !== undefined;
        const hasFilter2 = that.filterValue2 !== undefined;
        const hasFilter = hasFilter1 || hasFilter2;
        const keyFiguresRef = db.collection(hasFilter ? "KeyFigures" : "DayKeyFigures");
        let dayOffset = 0;
        let maxDayOffset = 5; // only allow a maximum of 5 days to be found

        do {
          let date = moment();
          date = date.subtract(dayOffset, "days");
          const dateString = date.format("YYYY-MM-DD");
          let foundDay = false;
          let query = keyFiguresRef.where("dateString", "==", dateString);

          if (hasFilter1) {
            query = query.where("orgEntity", "==", that.filterValue1);
          }

          if (hasFilter2) {
            query = query.where("subOrgEntity", "==", that.filterValue2);
          }

          await query.get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              if (!foundDay) {
                maxDayOffset--;
                foundDay = true;
              }

              const data = doc.data();
              const dateFormatted = date.format("DD.MM");

              if (hasFilter) {
                if (statData[dateString] === undefined) {
                  statData[dateString] = {
                    "date": date,
                    "dateFormatted": dateFormatted,
                    "bedsFull": 0,
                    "bedsEmpty": 0,
                    "bedsTotal": 0,
                    "admissions": 0,
                  };
                }

                statData[dateString].bedsFull += data.bedsFull || 0;
                statData[dateString].bedsEmpty += data.bedsEmpty || 0;
                statData[dateString].bedsTotal += data.bedsTotal || 0;
                statData[dateString].admissions += data.admissions || 0;
              } else {
                const bedsPercent = data.bedsFull * 100 / data.bedsTotal;
                statData[dateString] = {
                  "date": date,
                  "dateFormatted": dateFormatted,
                  "bedsFull": data.bedsFull || 0,
                  "bedsEmpty": data.bedsEmpty || 0,
                  "bedsTotal": data.bedsTotal || 0,
                  "bedsPercent": bedsPercent || 0,
                  "admissions": data.admissions || 0,
                }

                that.dates.push(dateFormatted);
                that.occupancyPercentages.push(bedsPercent);
                that.admissionsItems.push(data.admissions || 0);
              }
            });
          });

          if (hasFilter) {
            if (statData[dateString] !== undefined) {
              statData[dateString].bedsPercent = statData[dateString].bedsFull * 100 / statData[dateString].bedsTotal;
              that.dates.push(statData[dateString].dateFormatted);
              that.occupancyPercentages.push(statData[dateString].bedsPercent);
              that.admissionsItems.push(statData[dateString].admissions);
            }
          }

          dayOffset++;
        } while (maxDayOffset > 0 && dayOffset < 100);

        console.log(statData);
        this.stats = statData;
        this.dates.reverse();
        this.occupancyPercentages.reverse();
        this.admissionsItems.reverse();
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