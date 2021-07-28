<template>
  <v-container class="container">
    <v-row>
      <v-col>
        <v-simple-table dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th
                  v-for="(i, index) in dataRestFrom.x"
                  :key="index"
                  class="text-center"
                >
                  {{ i }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in dataRestFrom.y" :key="item.name">
                <td>{{ item }}</td>
                <td
                  v-for="i in dataRestFrom.metric.slice((dataRestFrom.x.length - 1) * index, (dataRestFrom.x.length - 1) * (index + 1))"
                  :key="i"
                >
                  {{ i }}
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
  name: "heatmap",
  props: {
    dataRestFrom: Object,
  },
  data() {
    return {
      testData: {},
    };
  },

  mounted() {
    this.testData = {
      y: ["name1", "name 2", "name 3"],
      x: ["", "дата один", "date 2", "date 3"],
      metric: [10, 10, 10, 10, 10, 10, 1, 2, 3],
    };
  },
};
</script>

<style lang="sass" scoped>
@import './../../sass/dashHeatMap'
</style>
