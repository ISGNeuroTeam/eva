<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
      class="dash-grid-group no-draggable"
    >
      <div v-if="dataRestFrom.length === 0">
        <span>Нет данных для отображения</span>
      </div>
      <div
        v-else
        :style="`height: ${box.height}px; overflow: auto;`"
      >
        <grid-layout
          :layout.sync="dashes"
          :col-num="colNum"
          :row-height="rowHeight"
          :is-draggable="false"
          :is-resizable="false"
          :is-mirrored="false"
          :vertical-compact="true"
          :margin="colMargin"
          :use-css-transforms="false"
        >
          <grid-item
            v-for="item in dashes"
            :key="item.i"
            class="grid-widget"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :i="item.i"
          >
            <v-card-text
              :is="`dash-${vizCodes[item.row.visualization.toLowerCase()]}`"
              :id-from="`${item.row.visualization}-${idFrom}-${item.option_key}-v1`"
              :id-dash-from="idDash"
              :color-from="theme"
              :options="dashItemOptions[item.i] || {}"
              :search="{}"
              :size-from="{
                height: (item.h * rowHeight) + 36,
                width: box.width / colNum * (colNum > item.w ? item.w : colNum) - 56,
              }"
              :size-tile-from="{
                height: (item.h * rowHeight) + 36,
                width: (box.width - 56) * (colNum >= item.w ? colNum / item.w : 1),
              }"
              :height-from="(item.h * rowHeight) + 36"
              :width-from="(box.width - 56) * (colNum >= item.w ? colNum / item.w : 1)"
              :search-rep="true"
              :data-report="true"
              :data-rest-from="dataSourcesBySid.find(obj => obj.sid === item.row.source).data"
              :current-settings="settings"
              :update-settings="updateSettings"
              :data-mode-from="dataModeFrom"
              :loading="loading"
              :store-state-dash.sync="stateDash[item.i]"
              :data-sources="dataSources"
              :is-full-screen="bigSizeMode"
              :full-screen="bigSizeMode"
              time-format-from=""
              :table-per-page="100"
              :table-page="1"
              :selected-pie-index="-1"
              :custom-style="{
                color: theme.$main_text,
                background: 'var(--main_bg)',
              }"
              custom-class="card-text element-itself grid-elem"
              @hideDS="hideDS($event)"
              @setVissible="setVissible($event)"
              @setLoading="setLoading($event)"
            />
          </grid-item>
        </grid-layout>
      </div>
    </div>
  </portal>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout';

export default {
  name: 'DashGridGroup',
  components: {
    GridLayout,
    GridItem,
  },
  inheritAttrs: false,
  props: {
    idFrom: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    dataRestFrom: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      default: true,
    },
    dataReport: {
      type: Boolean,
      default: false,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    sizeFrom: {
      type: Object,
      required: true,
    },
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
    },
    colMargin: {
      type: Array,
      default: () => ([8, 8]),
    },
    dataPageFrom: {
      type: String,
      default: '',
    },
    dataModeFrom: {
      type: Boolean,
      default: false,
    },
    dataSources: {
      type: Object,
      default: () => ({}),
    },
    vizCodes: {
      type: Object,
      default: () => ({
        multiline: 'multiLine',
        ygraph: 'ygraph',
        singlevalue: 'singleValue',
        piechart: 'piechart',
        tile: 'tile',
        accumulators: 'accumulators',
      }),
    },
  },
  data() {
    return {
      actions: [
        { name: 'updated', capture: ['pointX', 'pointY'] },
      ],
      defaultSettings: {},
      bigSizeMode: false,
      stateDash: {},
      dashItemOptions: {},
      props: {
        id: '',
        name: '',
        icons: {},
        edit: true,
        nodata: false,
        justCreate: true,
        edit_icon: true,
        move_elem: true,
        resize_elem: true,
        datasource_elem: true,
        showOptions: true,
        arrow_coral: 'controlsInsideDash',
        resize_arrow_coral: 'controlsInsideDash',
        code_coral: 'fill:teal',
        transition: true,
        element: '',
        page: '',
        dataRest: [],
        loading: false,
        open_gear: true,
        open_title: false,
        options: {
          visible: true,
          change: false,
          level: 1,
          boxShadow: false,
        },
        optionsBoxShadow: 'transparent',
        differentOptions: {
          visible: true,
        },
        disappear: true,
        timeFormat: '',
        sizeTile: {},
        hideLoad: false,
        tooltip: {},
        metricsMulti: [],
      },
      settings: {
        showTitle: true,
      },
      defaultOptions: {
        colNum: 10,
        rowHeight: 60,
      },
    };
  },
  computed: {
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    dashStore() {
      const { id, idDash } = this;
      if (!this.$store.state[idDash][id]) {
        this.$store.commit('setDefaultOptions', { id, idDash });
      }
      return this.$store.state[idDash][id];
    },
    tokensStore() {
      const { idDash } = this;
      return this.$store.state[idDash].tockens;
    },
    draggable() {
      const { idDash } = this;
      return this.$store.state[idDash].dragRes || false;
    },
    options() {
      return {
        ...this.defaultOptions,
        ...this.dashStore?.options,
      };
    },
    box() {
      const { sizeFrom } = this;
      const { width, height } = sizeFrom;
      return {
        width: Math.round(width),
        height: Math.round(height) - 46,
      };
    },
    colNum() {
      return +this.options.colNum || this.defaultOptions.colNum;
    },
    rowHeight() {
      return +this.options.rowHeight || this.defaultOptions.rowHeight;
    },
    dashes: {
      get() {
        let x = 0;
        let y = 0;
        let maxRowH = 0;
        const list = new Map();
        this.dataRestFrom
          .forEach((item, n) => {
            const { colNum } = this;
            const sizes = item.size.split(',');
            if (maxRowH < +sizes[1]) {
              maxRowH = +sizes[1];
            }
            if (+sizes[0] + x > colNum) {
              x = 0;
              y += maxRowH;
              maxRowH = 0;
            }
            const params = {
              row: item,
              i: item.id,
              w: +sizes[0],
              h: +sizes[1],
              x,
              y,
              text: `${n} (x: ${x}, y: ${y}) [${sizes[0]}x${sizes[1]}]`,
              option_key: item.option_key || item.id,
            };
            if (+sizes[0] + x <= colNum) {
              x += +sizes[0];
            }
            list.set(item.id, params);
          });
        return [...list.values()];
      },
    },
    idToSidObj() {
      return this.$store.state[this.idDash].searches.map(({ id, sid }) => ({ id, sid }));
    },
    dataSourcesBySid() {
      return this.idToSidObj.map((item) => ({
        ...item,
        ...this.dataSources[item.id],
      }));
    },
  },
  methods: {
    updateSettings(val) {
      this.settings = JSON.parse(JSON.stringify(val));
    },
    hideDS() {
      this.$store.commit('setSwitch', {
        idDash: this.idDash,
        status: true,
        id: this.element,
      });
    },
    setVissible({ element, overflow }) {
      if (element.split('-')[0] === 'picker' || element.split('-')[0] === 'guntt') {
        const elDashBlock = this.$el.querySelector('.dash-block');
        if (elDashBlock) {
          elDashBlock.style.overflow = overflow;
        }
      }
    },
    setLoading(event) {
      if (this.element.indexOf('button') !== -1) {
        this.props.hideLoad = !event;
      }
      this.props.loading = event;
    },
  },
};
</script>

<style lang="sass" scoped>
.dash-grid-group
  text-align: left
  margin: 2px

.grid-widget
  overflow: auto
  border: .5px solid var(--main_border)
  background-color: var(--main_bg)

.grid-widget > div
  display: flex
  justify-content: space-around
  align-items: stretch
  align-content: center
  flex-direction: column
  flex-wrap: nowrap
  flex: 1
  height: 100%

</style>