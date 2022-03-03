<template>
  <div class="heatmap-container px-0">
    <v-simple-table
      dense
      fixed-header
      class="heatmap-table"
      height="100%"
    >
      <template v-slot:default>
        <thead>
          <tr>
            <th class="table-th" />
            <th
              v-for="(y, index) in filteredY"
              :key="index"
              class="text-center table-th"
              @click="onClickTd(null, y)"
              v-text="y"
            />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="x in filteredX"
            :key="x"
          >
            <td
              class="text-left"
              @click="onClickTd(x)"
            >
              <v-menu
                open-on-hover
                top
                offset-y
              >
                <template v-slot:activator="{ on, attrs }">
                  <span
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{ x }}
                  </span>
                </template>

                <v-list>
                  <v-list-item
                    v-for="(item, index) in ['Детали']"
                    :key="index"
                  >
                    <v-list-item-title
                      style="color: black"
                    >
                      <a @click="setClick(x)">{{ item }}</a>
                    </v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </td>

            <td
              v-for="y in filteredY"
              :key="y"
              class="pa-0"
              @click="onClickTd(x, y)"
            >
              <div
                v-if="filteredData[x][y] && filteredData[x][y].metadata"
                class="td-inner"
                :style="{
                  backgroundColor: filteredData[x][y].metadata.background_color,
                }"
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
  name: 'Heatmap',
  components: { DashHeatMapLinear },
  props: {
    dataRestFrom: Array,
    options: Object,
    idFrom: null,
    idDashFrom: null,
  },
  data: () => ({
    x: new Set(),
    y: new Set(),
    updateData: 0,
    data: {},
    xField: 'x',
    yField: 'y',
    dataField: 'metric',
    detailValue: null,
    xFieldFormat: 'Строка',
    xFieldSort: 'По возрастанию',
    yFieldFormat: 'Дата',
    yFieldSort: 'По возрастанию',
    renderData: 'metadata',
    defaultActions: [
      {
        name: 'click',
        capture: [],
      },
    ],
  }),
  computed: {
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    events() {
      return this.getEvents({
        event: 'OnDataCompare',
      });
    },
    filteredData() {
      return this.updateData && this.data;
    },

    filteredY() {
      const temp = Array.from(this.y);
      if (this.yFieldFormat === 'Строка') {
        if (this.yFieldSort === 'По возрастанию') temp.sort();
        else temp.sort().reverse();
      } else {
        const sort = this.chooseSort(this.yFieldFormat, this.yFieldSort);
        temp.sort(sort);
      }
      return this.updateData && temp;
    },

    filteredX() {
      const temp = Array.from(this.x);
      if (this.xFieldFormat === 'Строка') {
        if (this.xFieldSort === 'По возрастанию') temp.sort();
        else temp.sort().reverse();
      } else {
        const sort = this.chooseSort(this.xFieldFormat, this.xFieldSort);
        temp.sort(sort);
      }
      return this.updateData && temp;
    },

    actions() {
      let capture = [];
      if (this.dataRestFrom && this.dataRestFrom[0]) {
        capture = Object.keys(this.dataRestFrom[0]);
      }
      return this.defaultActions.map((action) => ({ ...action, capture }));
    },
  },
  watch: {
    actions(actions) {
      this.$store.commit('setActions', {
        actions,
        idDash: this.idDash,
        id: this.id,
      });
    },
    dataRestFrom() {
      if (this.dataRestFrom && this.dataRestFrom[0]) {
        const fields = Object.keys(this.dataRestFrom[0]);
        this.$store.commit('setOptions', {
          id: this.idFrom,
          idDash: this.idDashFrom,
          options: {},
          titles: fields,
        });
      }
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
        if (newVal.detailValue) this.detailValue = newVal.detailValue;
        if (newVal.ySort) this.yFieldSort = newVal.ySort;
        if (newVal.ySort) this.xFieldSort = newVal.xSort;
        if (newVal.ySort) this.yFieldFormat = newVal.yFormat;
        if (newVal.ySort) this.xFieldFormat = newVal.xFormat;
        this.updateData += 1;
        this.render();
      },
    },
  },

  mounted() {
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
  },

  methods: {
    onClickTd(x = null, y = null) {
      let val = null;
      let row = null;
      if (x !== null && y !== null) {
        val = this.filteredData[x][y]?.value;
        row = this.filteredData[x][y]?.row;
      }

      this.$store.state[this.idDash].tockens.forEach((token) => {
        if (token.elem === this.id && token.action === 'click') {
          let value;
          const { capture } = token;
          const captureIdx = ['x', 'y', 'value'].indexOf(capture);
          if (captureIdx !== -1) {
            value = [x, y, val][captureIdx];
          } else if (row && capture !== '') {
            value = row[capture];
          } else {
            value = null;
          }
          this.$store.commit('setTocken', {
            tocken: token,
            idDash: this.idDash,
            value,
          });
        }
      });
    },
    getEvents({ event, partelement }) {
      let result = [];
      if (!this.$store.state[this.idDash].events) {
        this.$store.commit('setState', [{
          object: this.$store.state[this.idDash],
          prop: 'events',
          value: [],
        }]);
        return [];
      }
      if (partelement) {
        result = this.$store.state[this.idDash].events.filter((item) => (
          item.event === event
          && item.element === this.id
          && item.partelement === partelement
        ));
      } else {
        result = this.$store.state[this.idDash].events.filter(
          (item) => item.event === event
            && item.target === this.id,
        );
      }
      return result;
    },
    setClick(tokenValue) {
      if (this.detailValue) {
        const [first] = Object.keys(this.filteredData[tokenValue]);
        tokenValue = this.filteredData[tokenValue][first].row[this.detailValue];
      }
      const events = this.getEvents({
        event: 'onclick',
        partelement: 'empty',
      });
      if (events.length !== 0) {
        events.forEach((item) => {
          if (item.action === 'go') {
            item.value[0] = tokenValue;
            this.$store.dispatch('letEventGo', {
              event: item,
              id: this.id,
              idDash: this.idDash,
              route: this.$router,
              store: this.$store,
            });
          }
        });
      }
    },
    chooseSort(dataFormat, sortType) {
      let sort;
      if (dataFormat === 'Дата') {
        const up = (a, b) => new Date(a) - new Date(b);
        const down = (a, b) => new Date(b) - new Date(a);

        sort = sortType === 'По возрастанию' ? up : down;
        return sort;
      } if (dataFormat === 'Число') {
        const up = (a, b) => a - b;
        const down = (a, b) => b - a;

        sort = sortType === 'По возрастанию' ? up : down;
        return sort;
      }
      return sort;
    },

    render() {
      this.x = new Set();
      this.y = new Set();
      this.updateData = 0;
      this.data = {};
      this.dataRestFrom.forEach((obj) => {
        const xField = obj[this.xField];
        const yField = obj[this.yField];

        if (!this.data[xField]) {
          this.data[xField] = {};
        }

        this.data[xField][yField] = {
          value: obj[this.dataField],
          metadata: this.parseMetadata(obj.metadata),
          row: obj,
        };

        this.x.add(xField);
        this.y.add(yField);
        this.updateData += 1;
      });
    },

    /**
     * Transform metadata string to object.
     * @param {string} data Metadata string.
     * @returns {(object | null)} Metadata object or null.
     */
    parseMetadata(data = null) {
      try {
        if (typeof data !== 'string') return null;
        return !data ? null : JSON.parse(data.replaceAll('\'', '"'));
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
