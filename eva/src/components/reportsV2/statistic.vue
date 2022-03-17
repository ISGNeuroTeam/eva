<template>
  <div
    class="statistic"
    :style="{ background: theme.$main_bg, color: theme.$main_text }"
  >
    <v-card-text
      :is="`dash-table`"
      v-show="true"
      id-from="table"
      :color-from="theme"
      active-elem-from="table"
      id-dash-from="reports"
      :width-from="size.width"
      :height-from="size.height"
      :time-format-from="''"
      :size-tile-from="{ width: '', height: '' }"
      :search-rep="true"
      :tooltip-from="tooltipSvg"
      :should-get="false"
      :data-report="true"
      :data-rest-from="data"
    />
  </div>
</template>

<script>
import { mdiRefresh, mdiMagnify } from '@mdi/js';

export default {
  props: {
    data: Array,
    size: Object,
  },
  data() {
    return {
      tooltipSvg: { texts: [], links: [], buttons: [] },
      mdiRefresh,
      mdiMagnify,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  mounted() {
    // this.calcSize();
  },
  methods: {
    calcSize() {
      alert('calcSize');
      const size = this.$refs.vis.getBoundingClientRect();
      this.size.width = Math.round(size.width) - 16;
      this.size.height = Math.round(size.height) - 66;
      console.log(size);
    },
  },
};
</script>

<style lang="scss"></style>
