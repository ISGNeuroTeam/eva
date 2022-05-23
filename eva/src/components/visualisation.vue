<template>
  <div :options="String(options)">
    <v-card-text
      :is="currentElem"
      v-if="idFrom && dashFromStore"
      custom-class="card-text element-itself"
      :color-from="theme"
      :custom-style="{
        color: theme.$main_text,
        background: 'transparent'
      }"
      :id-from="idFrom"
      :id-dash-from="idDash"
      :data-rest-from="sData"
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
      :options="props.currentOptions"
      :current-settings="settings"
      :update-settings="updateSettings"
      :is-full-screen="isFullScreen"
      :full-screen="isFullScreen"
      :table-per-page="tablePerPage"
      :table-page="tablePage"
      :selected-pie-index="selectedPieindex"
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
    spaceName: {
      type: String,
      default: '',
    },
    mode: Boolean,
  },
  data: () => ({
    loading: false,
    fullScreenHeight: 0.8 * window.innerHeight,
    fullScreenWidth: 0.8 * window.innerWidth,
    newDashBoard: {},
    storeDash: null,
    settings: {
      showTitle: true,
    },
    props: {
      currentOptions: {
        visible: true,
        change: false,
        level: 1,
        boxShadow: false,
      },
    },
  }),
  computed: {
    idFrom() {
      return this.spaceName ? `${this.element}-${this.spaceName}` : this.element;
    },
    sData() {
      return this.data;
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
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.idFrom, idDash: this.idDash });
      }

      if (!this.dashFromStore?.options.pinned) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pinned',
          value: false,
        }]);
      }

      if (!this.dashFromStore.options.lastDot) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'lastDot',
          value: false,
        }]);
      }
      if (!this.dashFromStore.options.stringOX) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'stringOX',
          value: false,
        }]);
      }
      if (!this.dashFromStore?.options.united) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'united',
          value: false,
        }]);
      }

      return this.dashFromStore.options;
    },
    options() {
      const options = this.getOptions;
      this.setOptionsItems(options);

      return options.change;
    },
  },
  methods: {
    updateSettings(localSettings) {
      this.settings = structuredClone(localSettings);
    },
    setOptionsItems(options) {
      Object.keys(options).forEach((item) => {
        this.props.currentOptions[item] = options[item];
      });
    },
  },
};
</script>

<style>

</style>
