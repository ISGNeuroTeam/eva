<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
      class="dash-grid-group"
    >
      <div v-if="dataRestFrom.length === 0">
        <span>Нет данных для отображения</span>
      </div>
      <div v-else-if="errorMessage">
        <span>{{ errorMessage }}</span>
      </div>
      <div
        v-else
        :style="`height: ${box.height}px; overflow: auto;`"
      >
        <grid-layout
          :layout.sync="components"
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
            v-for="item in components"
            :key="item.i"
            class="grid-widget"
            :x="item.x"
            :y="item.y"
            :w="item.w"
            :h="item.h"
            :i="item.i"
          >
            <div
              v-if="dashFromStore.editMode && item.hasSettings"
              class="setting-icon"
            >
              <v-icon
                left
                class="icon-main"
                @click.prevent="switchOP(item)"
                v-text="mdiSettings"
              />
            </div>
            <div
              v-if="item.errorForElem"
              class="absolute--top absolute absolute--center-h"
            >
              {{ item.errorMessageForElem +', id элемента ' + item.row.id }}
            </div>
            <v-card-text
              :is="item.dash"
              v-if="gridRendered && !item.errorForElem"
              :id-from="item.visualizationId"
              :id-dash-from="idDash"
              :color-from="theme"
              :options="getOptions[item.i] || {}"
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
              :data-rest-from="(
                dataForVisualizations[item.visualizationId]
                  ? item.dataRest.data
                  : item.dataRest
              ) || [] "
              :current-settings="settings[item.visualizationId]"
              :update-settings="(val) => updateSettings(val, item.visualizationId)"
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
              custom-class="card-text element-itself"
              class="grid-elem"
              @hideDS="hideDS($event)"
              @setVissible="setVissible($event)"
              @setLoading="setLoading($event)"
              @SetRange="setRange($event, item)"
              @resetRange="$emit('resetRange', item.dataRest.id)"
            />
          </grid-item>
        </grid-layout>
      </div>
    </div>
  </portal>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout';
import { mdiSettings } from '@mdi/js';

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
    vizOptions: {
      type: Object,
      default: () => ({
        multiline: {
          dash: 'multiLine',
        },
        ygraph: {
          dash: 'ygraph',
        },
        singlevalue: {
          dash: 'singleValue',
        },
        piechart: {
          dash: 'piechart',
          mainSettings: true,
        },
        tile: {
          dash: 'tile',
          mainSettings: true,
        },
        accumulators: {
          dash: 'accumulators',
          mainSettings: true,
        },
        dial: {
          dash: 'dial',
        },
        gauge: {
          dash: 'gauge',
        },
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
      mdiSettings,
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
      dataForVisualizations: {},
      gridRendered: true,
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
    fullDashFromStore() {
      return this.$store.state[this.idDash];
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
    errorMessage() {
      // when more data
      const vizLimit = 100;
      if (this.dataRestFrom.length > vizLimit) {
        return `Вы попытались вывести больше ${vizLimit} визуализаций`;
      }

      if (this.dataRestFrom.length > 0) {
        // when not found required fields
        const requiredFields = ['id', 'size', 'visualization', 'source'];
        const notFoundFields = [];
        const firstRow = Object.keys(this.dataRestFrom[0]);
        requiredFields.forEach((field) => {
          if (!firstRow.includes(field)) {
            notFoundFields.push(field);
          }
        });
        if (notFoundFields.length) {
          return `Не передан параметр ${notFoundFields.join(', ')}`;
        }

        // when exists doubles of id
        const existsIds = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const row of this.dataRestFrom) {
          const id = `${row.id}`;
          if (existsIds.includes(id)) {
            return `Найден дубль ID: ${id}`;
          }
          existsIds.push(id);
        }
      }
      return null;
    },
    components: {
      get() {
        let l = 0;
        let t = 0;
        let maxRowH = 0;
        const list = new Map();
        const { colNum } = this;
        this.dataRestFrom
          .forEach((item) => {
            const optionKey = item.option_key || item.id;
            const visualizationId = `${item.visualization}-${this.idFrom}-${optionKey}-v1`;
            const [itemW, itemH] = item.size.split(',').map((str) => +str);
            if (maxRowH < itemH) {
              maxRowH = itemH;
            }
            if (l + itemW > colNum) {
              l = 0;
            }
            const vizOptions = this.vizOptions[item.visualization.toLowerCase()];
            if (!vizOptions) {
              return;
            }
            if (!this.dataForVisualizations[visualizationId]) {
              this.updateDataRestVisualizations(item, visualizationId);
            }
            const params = {
              row: item,
              i: item.id,
              w: itemW,
              h: itemH,
              x: l,
              y: t,
              dash: `dash-${vizOptions.dash}`,
              visualizationId,
              optionKey,
              dataRest: this.dataForVisualizations[visualizationId],
              hasSettings: !!vizOptions.mainSettings,
              errorForElem: this.dataForVisualizations[visualizationId]?.errorForElem,
              errorMessageForElem: this.dataForVisualizations[visualizationId]?.errorMessageForElem,
            };
            if (!this.settings[visualizationId]) {
              this.$set(this.settings, visualizationId, {});
            }
            list.set(item.id, params);
            if (l + itemW <= colNum) {
              l += itemW;
            }
            if (l + itemW > colNum) {
              t += maxRowH;
              maxRowH = 0;
            }
          });
        return [...list.values()];
      },
    },
    dashFromStore() {
      return this.$store.state[this.idDash];
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
    getOptions() {
      return this.dataRestFrom.reduce((obj, item) => {
        const optionKey = item.option_key || item.id;
        const visualizationId = `${item.visualization}-${this.idFrom}-${optionKey}-v1`;
        obj[item.id] = this.$store.state[this.idDash][visualizationId]?.options;
        return obj;
      }, {});
    },
  },
  watch: {
    loading(val) {
      if (val) {
        this.dataForVisualizations = {};
      }
    },
    box() {
      this.onGridResize();
    },
    dataSources: {
      deep: true,
      handler() {
        this.dataRestFrom
          .forEach((item) => {
            const optionKey = item?.option_key || item.id;
            const visualizationId = `${item.visualization}-${this.idFrom}-${optionKey}-v1`;
            this.updateDataRestVisualizations(item, visualizationId);
          });
      },
    },
  },
  mounted() {
    this.onGridResize();
  },
  methods: {
    onGridResize() {
      // даем сформировать размер сетки
      this.gridRendered = false;
      if (this.renderTO) clearInterval(this.renderTO);
      this.renderTO = setTimeout(() => {
        // после - рендер компонентов
        this.gridRendered = true;
      }, 10);
    },
    setRange({ range }, item) {
      const { xMetric = '_time' } = this.$store.state[this.idDash][item.visualizationId].options?.xAxis || {};
      this.$emit('SetRange', {
        range,
        elem: {
          elem: item.visualizationId,
          search: item.dataRest.id,
        },
        xMetric,
      });
    },
    updateSettings(val, visualizationId) {
      this.$set(this.settings, visualizationId, structuredClone(val));
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
    switchOP(item) {
      this.$store.dispatch('openModalSettings', {
        path: this.idDash,
        element: item.visualizationId,
      });
    },
    getDataRest(item, visualizationId) {
      this.$set(
        this.dataForVisualizations,
        visualizationId,
        {},
      );
      this.$store.dispatch('getDataApi', {
        idDash: this.idDash,
        search: {
          sid: null,
          original_otl: item.source,
          limit: 1000,
          parametrs: {
            tws: 0,
            twf: 0,
            username: this.$store.state.auth.userName,
            timeout: 60,
            preview: false,
            field_extraction: false,
            cache_ttl: 60,
          },
        },
      }).then((res) => {
        this.$set(
          this.dataForVisualizations,
          visualizationId,
          structuredClone({
            data: res.data,
            schema: res.schema,
            errorForElem: !res.data,
            errorMessageForElem: !res.data ? 'Нет данных для отображения' : '',
          }),
        );
      });
    },
    updateDataRestVisualizations(item, visualizationId) {
      const elementDataSources = this.dataSourcesBySid.find((obj) => obj.sid === item.source);
      if (item.source.includes('|')) {
        this.getDataRest(item, visualizationId);
      }
      this.$set(
        this.dataForVisualizations,
        visualizationId,
        structuredClone({
          ...elementDataSources,
          errorForElem: !elementDataSources,
          errorMessageForElem: !elementDataSources ? 'Нет данных для отображения' : '',
        }),
      );
    },
  },
};
</script>

<style lang="sass" scoped>
.dash-grid-group
  text-align: left
  margin: 2px
  ::v-deep
    .single-value-container
      height: 100% !important
    .gauge
      min-height: 170px
      .options-icon
        color: var(--secondary_text) !important
        top: 12px
        right: 12px

.grid-widget
  overflow: auto
  border: .5px solid var(--main_border)
  background-color: var(--main_bg)

.grid-elem
  display: flex
  justify-content: space-around
  align-items: stretch
  align-content: center
  flex-direction: column
  flex-wrap: nowrap
  flex: 1
  height: 100%
.setting-icon
  position: absolute
  top: 0
  right: 0
  justify-content: flex-start
  align-self: flex-start
  align-content: flex-start
  align-items: flex-start
  padding-top: 10px
.icon-main
  color: var(--main_text) !important
  cursor: pointer
  margin-bottom: auto

</style>
