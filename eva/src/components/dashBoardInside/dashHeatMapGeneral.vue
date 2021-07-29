<template>
  <v-container class="container">
    <v-row>
      <v-col>
        <v-simple-table dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th>
                </th>
                <th
                  v-for="(i, index) in filteredY"
                  :key="index"
                  class="text-center header"
                >
                  {{ i }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(x, index) in filteredX" :key="index">
                <td>
                  {{filteredX[index]}}
                </td>
                <td
                  v-for="(y, index) in filteredY"
                  :key="index"
                >
                  {{filteredData[x][y]}}
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: "heatmapGeneral",
  props: {
    dataRestFrom: Array,
  },
  data() {
    return {
      testData: {},
      x: new Set(),
      y: new Set(),
      updateData: 0,
      data: {},
      xField: "x",
      yField: "y",
      dataField: "metric",
      renderData: "metadata",
    };
  },
  computed: {
    filteredData() {
      console.log("updated");
      return this.updateData && this.data
    },
    filteredY() {
      return this.updateData && Array.from(this.y)
    },
    filteredX() {
      return this.updateData && Array.from(this.x)
    }
  },
  watch: {
    dataRestFrom() {
      this.x = new Set();
      this.y = new Set();
      this.updateData = 0;
      this.data = {};
      console.log("test")
      for (let obj of this.dataRestFrom) {
        this.x.add(obj[this.xField])
        this.y.add(obj[this.yField])
        if (!this.data[obj[this.xField]])
          this.data[obj[this.xField]] = {}
        this.data[obj[this.xField]][obj[this.yField]] = obj[this.dataField]
        this.updateData += 1;
      }
    }
  },
};
</script>

<style lang="sass" scoped>
@import './../../sass/dashHeatMap'
</style>
