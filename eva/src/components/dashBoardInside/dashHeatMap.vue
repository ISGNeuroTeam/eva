<template>
  <v-container>
    <v-row>
      <v-select> </v-select>
    </v-row>
    <v-row>
      <dash-heat-map-linear :value="10"/>
      <div class="heatmap-header">
        <v-data-table
          :headers="selectedHeaders"
          :items="computedData"
          :items-per-page="5"
          class="elevation-1"
        >
          <template v-slot:item="{ headers, item, index }">
            <tr>
              <td v-for="val in item">
                {{ val }}
              </td>
            </tr>
          </template>
        </v-data-table>
      </div>
      
    </v-row>
  </v-container>
</template>

<script>
import DashHeatMapLinear from "./dashHeatMapLinear.vue"
export default {
  components: {
    DashHeatMapLinear,
  },
  props: {
    idFrom: {
      type: String,
      default: "",
    },
    idDashFrom: {
      type: String,
      default: "",
    },
    widthFrom: {
      type: Number,
      default: 0,
    },
    heightFrom: {
      type: Number,
      default: 0,
    },
    colorFrom: {
      type: Object,
      default: () => ({}),
    },
    dataRestFrom: {
      type: Array,
      default: () => [],
    },
    dataReport: null,
    dataLoadingFrom: null,
  },
  data: () => ({
    metricList: new Set(),
    allDates: new Set(),
    users: {},
    userCount: new Set(),
  }),
  computed: {
    filteredData() {
      return this.dataRestFrom;
    },

    selectedHeaders() {
      if (Array.isArray(this.allDates))
        return this.allDates.slice(0, 7).map((val) => {
          return { text: val, value: val };
        });
      return [];
    },

    computedData() {
      let test =[];
      for ( let key in  this.users) {
        test.push([key, [this.users[key]]])
      }
      return test
    }
  },
  watch: {
    dataRestFrom() {
      const sspMaxDeep = new Set();
      const sspObject = {};
      let dates = new Set();
      this.dataRestFrom.forEach((data) => {
        const { ssp, variable, День, user } = data;
        if (День) {
          dates.add(День);
        }
        if (ssp) {
          const sspData = ssp.split("/");
          const maxDeep = Math.max(...sspMaxDeep.add(sspData.length));
          for (let i = 0; i < maxDeep; i++) {
            if (!sspObject[i]) sspObject[i] = new Set();
            if (!sspData[i]) break;
            sspObject[i].add(sspData[i].trim());
          }
        }

        // users
        if (user) {
          if (this.users[user]) {
            this.$set(this.users[user], День, { [variable]: data.value });
          } else {
            this.$set(this.users, user, new Map());
          }
        }
        this.userCount.add(user);
        this.metricList.add(variable);
      });

      // объект с данными об иерархии
      // console.log(sspObject);
      // console.log(Array.from(dates));
      dates = Array.from(dates).sort((a, b) => new Date(b) - new Date(a));
      this.allDates = dates;

      this.$forceUpdate();
    },
  },
  mounted() {},
  methods: {},
};
</script>

<style scoped>
.heatmap-header {
}
</style>
