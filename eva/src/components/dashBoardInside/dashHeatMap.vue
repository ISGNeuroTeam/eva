<template>
  <v-container class="container">
    <v-row>
      <v-col
        v-for="(ssp, i) in computedSSP"
        :key="i"
        cols="3"
      >
        <v-select
          :items="ssp"
          :append-icon="mdiChevronDown"
          dense
          class="select"
          outlined
          hide-details
        />
      </v-col>
      <v-col cols="3">
        <v-select
          v-model="selectedMetric"
          :items="Array.from(metricList)"
          :append-icon="mdiChevronDown"
          class="select"
          dense
          outlined
          hide-details
        />
      </v-col>
    </v-row>
    <v-row justify="center">
      <v-data-table
        :headers="selectedHeaders"
        :items="computedData"
        :items-per-page="-1"
        hide-default-footer
        disable-sort
        fixed-header
        height="300"
      >
        <template v-slot:item="{ headers, item }">
          <tr>
            <template v-for="(val, index) in item">
              <td
                v-if="index === 0 && item[1].fio"
                :key="index"
                style="text-align: left;"
                v-text="item[1].fio"
              />
              <td
                v-else-if="index === 0"
                :key="index"
                style="text-align: left;"
                v-text="val"
              />

              <template v-else v-for="(header, index) in headers">
                <td v-if="index !== 0" :key="index">
                  <DashHeatMapLinear
                    v-if="
                      val[headers[index].value] &&
                      showProperty(val[headers[index].value], selectedMetric)
                    "
                    :value="
                      showProperty(
                        val[headers[index].value],
                        selectedMetric
                      )
                    "
                    :comment="
                      showProperty(
                        val[headers[index].value],
                        'description'
                      )
                    "
                  />
                  <span v-else>Нет данных</span>
                </td>
              </template>
            </template>
          </tr>
        </template>
      </v-data-table>
    </v-row>
  </v-container>
</template>

<script>
import DashHeatMapLinear from "./dashHeatMapLinear.vue";
import { mdiChevronDown } from '@mdi/js';

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
    mdiChevronDown,
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
          ...this.allDates.slice(0, 7).map((value) => {
            const formatedDate = new Date(`${value}`);
            const text = formatedDate.toLocaleDateString("ru");
            return { value, text };
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
      const dates = new Set();

      this.dataRestFrom.forEach((data) => {
        const {
          fio, ssp, user, variable, value, 'День': day, _decription: description
        } = data;

        if (day) {
          dates.add(day);
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

        if (user) {
          if (this.users[user]) {
            this.$set(this.users[user], day, { description, [variable]: value });
          } else {
            this.$set(this.users, user, { fio });
          }
        }

        this.userCount.add(user);
        this.metricList.add(variable);
        this.selectedMetric = Array.from(this.metricList)[0];
      });

      this.allDates = Array.from(dates).sort((a, b) => new Date(a) - new Date(b));
      this.$forceUpdate();
    },
  },
  methods: {
    showProperty(object, property) {
      return object[property] ? object[property] : null;
    },
  },
};
</script>

<style lang="sass" scoped>
@import './../../sass/dashHeatMap';
</style>
