<template>
  <div>
    <div class="heatmap-header">
      {{ filteredData }}
      <!-- <v-data-table
        :headers="selectedHeaders"
        :items="filteredData"
        :items-per-page="5"
        class="elevation-1"
      >
        <template v-slot:item="{ headers, item }">
          <tr v-for="i in item">
            {{ i }}
          </tr>
        </template>
      </v-data-table> -->
    </div>
  </div>
</template>

<script>
export default {
  props: {
    idFrom: {
      type: String,
      default: '',
    },
    idDashFrom: {
      type: String,
      default: '',
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
  }),
  computed: {
    filteredData () {
      this.dataRestFrom.forEach(data => {
        this.metricList.add(data.variable);
        console.log(data);
      });
      console.log(this.metricList);
      return [];
      // return [
      //   { test1: 'qwe', test2: 'qwqe', test3: 'sdsdsd' },
      //   { test1: 'qwe2', test2: 'qwqe2', test3: 'sdsdsd2' },
      //   { test1: 'qwe3', test2: 'qwqe3', test3: 'sdsdsd3' },
      // ];
    },
    selectedHeaders () {
      return [
        { text: 'test1', value: 'test1'},
        { text: 'test2', value: 'test2'},
        { text: 'test3', value: 'test3'},
      ];
    },
  },
  mounted () {

  },
  methods: {

  },
};
</script>

<style scoped>
.heatmap-header {
  background-color: red;
}
</style>
