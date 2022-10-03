<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
      class="dash-grid"
    >
      <div v-if="dataRestFrom.length === 0">
        <span>Нет данных для отображения</span>
      </div>
    </div>
  </portal>
</template>

<script>

export default {
  name: 'dashGridGroup',
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
    dataModeFrom: Boolean,
    /** Props from Reports page. */
    dataReport: Boolean,
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
  },
  data() {
    return {
      actions: [
        { name: 'updated', capture: ['pointX', 'pointY'] },
      ],
      defaultSettings: {},
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
      return this.$store.state[idDash][id];
    },
    tokensStore() {
      const { idDash } = this;
      return this.$store.state[idDash].tockens;
    },
    options() {
      return {
        ...this.dashStore.options,
      };
    },

    box() {
      const { sizeFrom } = this;
      const { width, height } = sizeFrom;
      return {
        width: Math.round(width - 42),
        height: Math.round(height - 55) - 45,
      };
    },
  },
  watch: {
    box(val, old) {
      console.log('box', val, old);
    },
    fullScreenMode(val) {
      console.log('fullScreenMode', val);
    },
  },
  mounted() {
  },
  methods: {
  },
};
</script>

<style lang="sass" scoped>
.settings-icon
  float: right
  margin: 8px 2px

</style>
