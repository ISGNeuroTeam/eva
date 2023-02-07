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
      <svg ref="waterfall" />
      <DashWaterfallSettings
        v-model="isSettingsComponentOpen"
        :received-settings="chartOptions"
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
    };
  },
  computed: {
    ...mapGetters({
      theme: 'getTheme',
    }),
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
      return {
        ...this.options.chartOptions,
        titles: this.dataRestFrom.map((row) => row.title),
      };
    },
  },
  watch: {
    box(val, old) {
      if (JSON.stringify(val) !== JSON.stringify(old)) {
        this.resize();
      }
    },
    dataRestFrom(data) {
      if (data.length) {
        this.loadData(data);
      }
    },
    theme() {
      this.resize();
    },
    fullScreenMode() {
      this.$nextTick().then(() => {
        this.chart.moveInNewContainer(this.$refs.waterfall);
        this.chart.setSize(this.box.width, this.box.height);
        this.chart.render();
      });
    },
  },
  mounted() {
    this.initWaterfall();
    this.loadData(this.dataRestFrom);
    this.setActions(this.dataRestFrom);
  },
  methods: {
    initWaterfall() {
      if (!this.$refs.waterfall) {
        return;
      }
      const { width, height } = this.box;
      this.chart = new WaterfallClass(this.$refs.waterfall, width, height, this.chartOptions);
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
      // из за специфической работы фулскрина
      setTimeout(() => {
        this.chart.setSize(this.box.width, this.box.height);
        this.chart.render();
      }, 10);
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
    position: absolute;
    top: 50px;
    right: 18px;
  }
  svg {
    margin: 0 2px;
    fill: var(--main_text);
  }
}
</style>
