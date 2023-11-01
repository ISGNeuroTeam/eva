<template>
  <div>
    <v-card-text
      :is="currentElem"
      v-if="idFrom && dashFromStore && popupOpened"
      custom-class="card-text element-itself"
      :color-from="theme"
      :custom-style="{
        color: theme.$main_text,
        background: 'transparent'
      }"
      :id-from="idFrom"
      :id-dash-from="idDash"
      :data-rest-from="sData"
      :search-schema="searchSchema"
      :data-mode-from="mode"
      :loading="loading"
      :time-format-from="''"
      :size-tile-from="{}"
      :size-from="{
        height: fullScreenHeight,
        width: fullScreenWidth,
      }"
      :width-from="width"
      :height-from="height"
      :options="localOptions"
      :current-settings="settings"
      :update-settings="updateSettings"
      :is-full-screen="isFullScreen"
      :full-screen="isFullScreen"
      :table-per-page="tablePerPage"
      :table-page="tablePage"
      :selected-pie-index="selectedPieindex"
      @SetRange="sDataRange = $event"
      @resetRange="sDataRange = null"
    />
  </div>
</template>

<script>
export default {
  name: 'Visualisation',
  props: {
    element: {
      type: String,
      default: '',
    },
    width: {
      type: [String, Number],
      default: 0,
    },
    height: {
      type: [String, Number],
      default: 0,
    },
    isFullScreen: Boolean,
    tablePerPage: {
      type: [String, Number],
      default: 100,
    },
    tablePage: {
      type: [String, Number],
      default: 1,
    },
    selectedPieindex: {
      type: [String, Number],
      default: -1,
    },
    data: {
      type: Array,
      default: () => ([]),
    },
    searchSchema: {
      type: Object,
      default: () => ({}),
    },
    spaceName: {
      type: String,
      default: '',
    },
    mode: Boolean,
  },
  data: () => ({
    loading: false,
    popupOpened: false,
    fullScreenHeight: 0.82 * window.innerHeight,
    fullScreenWidth: window.innerWidth - 85,
    newDashBoard: {},
    sDataRange: null,
    localOptions: {
      visible: true,
      change: false,
      level: 1,
      boxShadow: false,
    },
    storeDash: null,
    settings: {
      showTitle: true,
    },
  }),
  computed: {
    idFrom() {
      return this.spaceName ? `${this.element}-${this.spaceName}` : this.element;
    },
    sData() {
      if (!this.sDataRange) {
        return this.data;
      }
      const { xMetric } = this.sDataRange;
      const [start, end] = this.sDataRange.range;
      return this.data.filter((item) => {
        const xValue = item[xMetric];
        return (xValue >= start && xValue <= end);
      });
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    currentElem() {
      let nameElement = '';
      if (this.element) {
        const element = this.element.split('-')[0];
        nameElement = `dash-${element}`;
      }
      return nameElement;
    },
    idDash() {
      return this.$route.params.id;
    },
    dashFromStore() {
      return this.$store.state[this.idDash][this.idFrom];
    },

    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (this.dashFromStore && !this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.idFrom, idDash: this.idDash });
      }

      return this.dashFromStore.options;
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.popupOpened = true;
    })
  },
  watch: {
    getOptions: {
      deep: true,
      immediate: true,
      handler(options) {
        this.localOptions = options;
      }
    },
  },
  methods: {
    updateSettings(localSettings) {
      this.settings = structuredClone(localSettings);
    },
  },
};
</script>

<style>

</style>
