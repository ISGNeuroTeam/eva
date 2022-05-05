<template>
  <div
    class="statistic"
    :style="{ background: theme.$main_bg, color: theme.$main_text }"
    :height-from="height"
  >
    <v-card-text
      :is="`dash-table`"
      v-show="true"
      id-from="table"
      :color-from="theme"
      active-elem-from="table"
      id-dash-from="reports"
      :size-from="{
        height: height,
        width: size.width,
      }"
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
    data: {
      type: Array,
      default: () => ([]),
    },
    size: {
      type: Object,
      default: () => ({}),
    },
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

    height() {
      let otstup = 390;
      if (window.screen.width <= 1600) {
        otstup = 80;
      }
      if (window.screen.width <= 1400) {
        otstup = 70;
      }
      if (this.data) {
        otstup -= 30;
      }
      // 120 это размер блока с пагинацией таблицы + шапка с настройками самого блока
      return this.size.height - otstup - 45;
    },
  },
  mounted() {
    // this.calcSize();
  },
  methods: {
    calcSize() {
      // alert('calcSize');
      const size = this.$refs.vis.getBoundingClientRect();
      this.size.width = Math.round(size.width) - 16;
      this.size.height = Math.round(size.height) - 66;
    },
  },
};
</script>

<style lang="scss"></style>
