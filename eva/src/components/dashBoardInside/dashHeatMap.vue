<template>
  <v-container>
    <v-row>
      <v-select v-for="(ssp, i) in computedSSP" :key="i" :items="ssp" />
      <v-select v-model="selectedMetric" :items="Array.from(metricList)" />
      <v-select v-model="period" :items="periods" />
    </v-row>
    <v-row>
      <div class="heatmap-header">
        <v-data-table
          :headers="selectedHeaders"
          :items="computedData"
          :items-per-page="5"
          class="elevation-1"
        >
          <template v-slot:item="{ headers, item }">
            <tr>
              <template v-for="(val, index) in item">
                <td v-if="index == 0" :key="index">
                  {{ val }}
                </td>
                <template v-else v-for="(i, index) in headers">
                  <td v-if="index != 0" :key="index">
                    <template
                      v-if="
                        val[headers[index].value] &&
                        showProperty(val[headers[index].value], selectedMetric)
                      "
                    >
                      <dash-heat-map-linear
                        :value="
                          showProperty(
                            val[headers[index].value],
                            selectedMetric
                          )
                        "
                      />
                    </template>
                    <template v-else> Нет данных </template>
                  </td>
                </template>
              </template>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-row>
  </v-container>
</template>

<script>
import DashHeatMapLinear from "./dashHeatMapLinear.vue";
export default {
  name: "heatmap",
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
    sspObject: {},
    userCount: new Set(),
    selectedMetric: "",
    period: "",
    periods: [],
  }),
  computed: {
    filteredData() {
      return this.dataRestFrom;
    },

    selectedHeaders() {
      if (Array.isArray(this.allDates)) {
        return [
          {},
          ...this.allDates.slice(0, 7).map((val) => {
            let formatedDate = new Date(`${val}`);
            return {
              text: formatedDate.toLocaleDateString("ru"),
              value: val,
            };
          }),
        ];
      }
      return [];
    },

    computedData() {
      return Object.entries(this.users);
    },

    computedSSP() {
      return Object.values(this.sspObject)
        .map((item) => [...item])
        .reverse();
    },
  },
  watch: {
    dataRestFrom() {
      const sspMaxDeep = new Set();
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
            if (!this.sspObject[i]) this.$set(this.sspObject, i, new Set());
            if (!sspData[i]) break;
            this.sspObject[i].add(sspData[i].trim());
          }
        }

        // users
        if (user) {
          if (this.users[user]) {
            this.$set(this.users[user], День, { [variable]: data.value });
          } else {
            this.$set(this.users, user, {});
          }
        }
        this.userCount.add(user);
        this.metricList.add(variable);
        this.selectedMetric = Array.from(this.metricList)[0];
      });

      // объект с данными об иерархии
      // console.log(Array.from(dates));
      dates = Array.from(dates).sort((a, b) => new Date(a) - new Date(b));
      this.allDates = dates;

      this.$forceUpdate();
    },
  },
  mounted() {},
  methods: {
    showProperty(object, property) {
      if (object[property]) {
        return object[property];
      } else null;
    },
  },
};
</script>

<style scoped>
</style>
