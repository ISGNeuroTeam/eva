<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      v-bind="$attrs"
      class="waterfall"
    >
      <v-icon
        v-if="dataModeFrom && !fullScreenMode"
        class="options-icon"
        :color="theme.$main_border"
        @click="isSettingsComponentOpen = true"
      >
        {{ icons.mdiSettings }}
      </v-icon>
      <div
        v-if="chartOptions.showLegend && legend"
        ref="legend"
        class="waterfall-legend pl-4"
        :style="{
          'margin-left': `${marginWaterfall.left}px`,
        }"
      >
        <div
          v-for="({ color }, title) in legend"
          :key="title"
          class="waterfall-legend__item"
        >
          <div
            class="waterfall-legend__color"
            :style="{
              'background-color': color,
            }"
          />
          <div class="waterfall-legend__title">
            {{ title }}
          </div>
        </div>
      </div>
      <svg ref="waterfall" />
      <DashWaterfallSettings
        v-model="isSettingsComponentOpen"
        :received-settings="{
          ...chartOptions,
          isLegend,
          isGrouped,
        }"
        @save="saveSettings"
        @close="closeSettings"
      />
    </div>
  </portal>
</template>

<script>
import { mapGetters } from 'vuex';
import { mdiSettings } from '@mdi/js';
import DashWaterfallSettings from './dashWaterfallSettings';
import WaterfallClass from '../../../js/classes/WaterfallClass';

export default {
  name: 'DashWaterfall',
  components: { DashWaterfallSettings },
  props: {
    sizeFrom: {
      type: Object,
      required: true,
    },
    dataRestFrom: {
      type: Array,
      required: true,
    },
    idFrom: {
      type: String,
      required: true,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    dataModeFrom: {
      type: Boolean,
      default: false,
    },
    icons: {
      type: Object,
      default: () => ({
        mdiSettings,
      }),
    },
  },
  data() {
    return {
      isSettingsComponentOpen: false,
      marginWaterfall: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      },
    };
  },
  computed: {
    ...mapGetters({
      theme: 'getTheme',
    }),
    ...mapGetters('app', [
      'userSettings',
    ]),
    dashFromStore() {
      return this.$store.state[this.idDashFrom][this.idFrom];
    },
    options() {
      return this.$store.state[this.idDashFrom][this.idFrom].options;
    },
    box() {
      const { width, height } = this.sizeFrom;
      return {
        width: Math.round(width) - 8,
        height: Math.round(height) - 50,
      };
    },
    tokensStore() {
      return this.$store.state[this.idDashFrom].tockens || [];
    },
    chartOptions() {
      const {
        numberFormat,
        decimalPlacesLimits,
      } = this.userSettings;
      return {
        ...this.options.chartOptions,
        numberFormat,
        decimalPlacesLimits,
        titles: this.dataRestFrom.map((row) => row.title),
      };
    },
    legend() {
      const { barsOptions } = this.chartOptions;
      const result = {};
      // eslint-disable-next-line no-restricted-syntax
      for (const el of this.dataRestFrom) {
        let color = '';
        // Легенда указана в настройках
        if (el?.legend) {
          // Элемент еще не добавлен
          if (!result[el.legend]) {
            // Цвет указан в OTL
            if (el?.color) {
              color = el?.color;
            }
            if (barsOptions?.length > 0 && !color) {
              const colorFromOptions = barsOptions.find((opt) => opt.title === el.title);
              // Настрйока указана для текущего
              if (colorFromOptions) {
                color = colorFromOptions.color;
              }
            }
            if (!color) {
              if (el.isTotal) {
                color = this.chartOptions.colorBarTotal;
              } else {
                color = el.value < 0
                  ? this.chartOptions.colorBarNegative
                  : this.chartOptions.colorBarPositive;
              }
            }
            result[el.legend] = {
              color,
            };
          }
        }
      }
      return Object.keys(result)?.length > 0 ? result : null;
    },
    isLegend() {
      return this.dataRestFrom.some((el) => el?.legend);
    },
    isGrouped() {
      if (this.dataRestFrom?.length === 0) {
        return false;
      }
      const titles = this.dataRestFrom.map((el) => el.title);
      if (titles?.length === 0) {
        return false;
      }
      return [...new Set(titles)]?.length !== titles?.length;
    },
  },
  watch: {
    box(val, old) {
      if (JSON.stringify(val) !== JSON.stringify(old)) {
        this.resize();
      }
    },
    dataRestFrom(val) {
      this.loadData(val);
    },
    theme() {
      this.resize();
    },
    fullScreenMode() {
      this.$nextTick().then(() => {
        this.chart.moveInNewContainer(this.$refs.waterfall);
        this.resize();
      });
    },
    legend() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.resize();
        });
      });
    },
  },
  mounted() {
    this.initWaterfall();
    this.loadData(this.dataRestFrom);
    this.setActions(this.dataRestFrom);
    this.resize();
  },
  methods: {
    initWaterfall() {
      if (!this.$refs.waterfall) {
        return;
      }
      const { width, height } = this.box;
      this.chart = new WaterfallClass(this.$refs.waterfall, width, height, this.chartOptions);
      this.marginWaterfall = this.chart.margin;
      this.chart.onClick = (row) => {
        this.tokensStore
          .filter(({ elem, action }) => (elem === this.idFrom && action === 'click'))
          .forEach((token) => {
            this.$store.commit('setTocken', {
              token,
              idDash: this.idDashFrom,
              value: row[token.capture],
            });
          });
      };
    },
    resize() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          const legendSize = this.$refs.legend ? this.$refs.legend.offsetHeight : 0;
          this.chart.setSize(this.box.width, this.box.height - legendSize);
          this.chart.render();
        });
      });
    },
    saveOptions(options) {
      this.$store.commit('setOptions', {
        id: this.idFrom,
        idDash: this.idDashFrom,
        options,
      });
    },
    loadData(data) {
      this.chart.update(data);
      this.setActions(data);
    },
    closeSettings() {
      this.isSettingsComponentOpen = false;
    },
    setActions(data) {
      if (data.length) {
        this.$store.commit('setActions', {
          actions: [
            { name: 'click', capture: Object.keys(data[0]) },
          ],
          idDash: this.idDashFrom,
          id: this.idFrom,
        });
      }
    },
    saveSettings(options) {
      this.closeSettings();
      this.saveOptions({ chartOptions: options });
      this.chart.updateOptions(options);
    },
  },
};
</script>

<style lang="scss">
.waterfall {
  color: var(--main_text);
  .options-icon {
    position: absolute !important;
    top: 50px;
    right: 18px;
  }
  svg {
    margin: 0 2px;
    fill: var(--main_text);
    foreignObject {
      &::-webkit-scrollbar {
        width: initial;
        display: none;
      }
    }
  }
  .waterfall-legend {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
    &__item {
      display: flex;
      justify-content: flex-start;
      flex-wrap: nowrap;
      align-items: center;
      gap: 8px;
    }
    &__color {
      width: 16px;
      height: 16px;
      border: 1px solid var(--main_border);
    }
    &__title {
      color: var(--main_text);
      font-size: 14px;
      line-height: 1.1;
      white-space: nowrap;
    }
  }
}
</style>
