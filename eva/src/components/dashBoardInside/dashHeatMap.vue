<template>
  <div class="heatmap-container px-0">
    <v-simple-table dense fixed-header class="heatmap-table" height="100%">
      <template v-slot:default>
        <thead>
          <tr>
            <th class="table-th"/>
            <th
              v-for="(y, index) in filteredY"
              :key="index"
              class="text-center table-th"
              v-text="y"
            />
          </tr>
        </thead>
        <tbody>
          <tr v-for="x in filteredX" :key="x">
            <td class="text-left" v-text="x"/>
            <td v-for="y in filteredY" :key="y" class="pa-0">
              <div
                v-if="filteredData[x][y] && filteredData[x][y].metadata"
                class="td-inner"
                :style="{ backgroundColor: filteredData[x][y].metadata.background_color }"
              >
                <DashHeatMapLinear
                  :title="filteredData[x][y].value"
                  :value="filteredData[x][y].metadata.progress_bar_value"
                  :color="filteredData[x][y].metadata.progress_bar_color"
                  :comment="filteredData[x][y].metadata.description"
                />
              </div>
              <div
                v-else-if="filteredData[x][y]"
                class="td-inner"
                v-text="filteredData[x][y].value"
              />
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </div>
</template>

<script>
import DashHeatMapLinear from './dashHeatMapLinear.vue';

export default {
  name: "heatmap",
  components: { DashHeatMapLinear },
  props: {
    dataRestFrom: Array,
    options: Object,
  },
  data: () => ({
    x: new Set(),
    y: new Set(),
    updateData: 0,
    data: {},
    xField: "x",
    yField: "y",
    dataField: "metric",
    xFieldFormat: "Строка",
    xFieldSort: "По возрастанию",
    yFieldFormat: "Дата",
    yFieldSort: "По возрастанию",
    renderData: "metadata",
  }),
  computed: {
    filteredData() {
      return this.updateData && this.data;
    },

    filteredY() {
      let temp = Array.from(this.y);
      if (this.yFieldFormat === "Строка") {
        if (this.yFieldSort === "По возрастанию")
          temp.sort();
        else
          temp.sort().reverse();
      }
      else {
        let sort = this.chooseSort(this.yFieldFormat, this.yFieldSort);
        temp.sort(sort);
      }
      return this.updateData && temp;
    },

    filteredX() {
      let temp = Array.from(this.x);
      if (this.xFieldFormat === "Строка") {
        if (this.xFieldSort === "По возрастанию")
          temp.sort();
        else
          temp.sort().reverse();
      }
      else {
        let sort = this.chooseSort(this.xFieldFormat, this.xFieldSort);
        temp.sort(sort);
      }
      return this.updateData && temp;
    },
  },
  watch: {
    dataRestFrom() {
      this.render();
    },

    options: {
      deep: true,
      immediate: true,
      handler(newVal) {
        if (newVal.x) this.xField = newVal.x;
        if (newVal.y) this.yField = newVal.y;
        if (newVal.data) this.dataField = newVal.data;
        if (newVal.x) this.renderData = newVal.metadata;
        if (newVal.ySort) this.yFieldSort = newVal.ySort;
        if (newVal.ySort) this.xFieldSort = newVal.xSort;
        if (newVal.ySort) this.yFieldFormat = newVal.yFormat;
        if (newVal.ySort) this.xFieldFormat = newVal.xFormat;
        this.updateData += 1;
        this.render();
      },
    },
  },
  methods: {
    chooseSort(dataFormat, sortType) {
      if (dataFormat === "Дата") {
        let up = (a, b) => {
          return new Date(a) - new Date(b);
        };
        let down = (a, b) => {
          return new Date(b) - new Date(a);
        };

        let sort;
        if (sortType === "По возрастанию") sort = up;
        else sort = down;
        return sort;
      } else if (dataFormat === "Число") {
        let up = (a, b) => {
          return a - b;
        };
        let down = (a, b) => {
          return b - a;
        };

        let sort;
        if (sortType === "По возрастанию") sort = up;
        else sort = down;
        return sort;
      }
    },

    render() {
      this.x = new Set();
      this.y = new Set();
      this.updateData = 0;
      this.data = {};
      for (let obj of this.dataRestFrom) {
        const xField = obj[this.xField];
        const yField = obj[this.yField];

        if (!this.data[xField]) {
          this.data[xField] = {};
        }

        this.data[xField][yField] = {
          value: obj[this.dataField],
          metadata: this.parseMetadata(obj.metadata),
        };

        this.x.add(xField);
        this.y.add(yField);
        this.updateData += 1;
      }
    },

    /**
     * Transform metadata string to object.
     * @param {string} data Metadata string.
     * @returns {(object | null)} Metadata object or null.
     */
    parseMetadata(data = null) {
      try {
        if (typeof data !== 'string') return null;
        return !data ? null : JSON.parse(data.replaceAll(`'`, `"`));
      } catch (err) {
        return null;
      }
    },
  },
};
</script>

<style lang="sass" scoped>
@import './../../sass/dashHeatMap'
</style>
