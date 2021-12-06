<template>
    <div
        class="statistic"
        :style="{background: theme.$main_bg, color: theme.$main_text}"
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
          :sizeTileFrom="{width: '', height: ''}"
          :searchRep="true"
          :tooltipFrom="tooltipSvg"
          :shouldGet="false"
          :dataReport="true"
          :dataRestFrom="data"
      />
    </div>
</template>


<script>
import { mdiRefresh, mdiMagnify } from '@mdi/js'

export default {
  props: {
    data: [],
    size: {},
  },
  data () {
    return {
      tooltipSvg:  { "texts": [], "links": [], "buttons": [] },
      mdiRefresh: mdiRefresh,
      mdiMagnify: mdiMagnify,
    }
  },
  computed: {
    theme () {
      return this.$store.getters.getTheme
    },
  },
}


</script>

<style lang="scss" >

</style>