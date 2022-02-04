<template>
  <div
    class="statistic"
    :style="{ background: theme.$main_bg, color: theme.$main_text }"
  >
    <v-card-text
      :is="`dash-table`"
      v-show="true"
      idFrom="table"
      :colorFrom="theme"
      activeElemFrom="table"
      idDashFrom="reports"
      :widthFrom="size.width"
      :heightFrom="size.height"
      :timeFormatFrom="''"
      :sizeTileFrom="{ width: '', height: '' }"
      :searchRep="true"
      :tooltipFrom="tooltipSvg"
      :shouldGet="false"
      :dataReport="true"
      :dataRestFrom="data"
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
      mdiRefresh: mdiRefresh,
      mdiMagnify: mdiMagnify,
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
    calcSize: function () {
      alert('calcSize');
      let size = this.$refs.vis.getBoundingClientRect();
      this.size.width = Math.round(size.width) - 16;
      this.size.height = Math.round(size.height) - 66;
      console.log(size);
    },
  },
};
</script>

<style lang="scss"></style>
