<template>
  <div>
    <div class="heatmap-header">
      {{ dataRestFrom }}
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
    selectedHeaders () {
      return [
        { text: 'test1', value: 'test1'},
        { text: 'test2', value: 'test2'},
        { text: 'test3', value: 'test3'},
      ];
    },
  },
  watch: {
    dataRestFrom () {
      const sspMaxDeep = new Set();
      const sspObject = {};
      this.dataRestFrom.forEach(data => {
        const { ssp, variable } = data;
        if (ssp) {
          const sspData = ssp.split('/');
          const maxDeep = Math.max(...sspMaxDeep.add(sspData.length));
          for (let i = 0; i < maxDeep; i++) {
            if (!sspObject[i]) sspObject[i] = new Set();
            if (!sspData[i]) break;
            sspObject[i].add(sspData[i].trim());
          }
        }
        this.metricList.add(variable);
      });
      // объект с данными об иерархии
      console.log(sspObject);
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

}
</style>
