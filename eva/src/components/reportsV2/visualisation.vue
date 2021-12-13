<template>
    <div
        ref="vis"
        class="visualisation"
        :style="{background: theme.$main_bg, color: theme.$main_text}"
    >
      <v-card-title class="title-vis">
        <v-tooltip
            v-for="i in elements"
            :key="aboutElem[i].key"
            bottom
            :color="theme.$accent_ui_color"
            @click="changeTab(i)"
        >
          <template v-slot:activator="{ on }">
            <v-icon
                class="title-icon"
                :color="aboutElem[i].color"
                v-on="on"
                @click="changeTab(i)"
            >
              {{ aboutElem[i].icon }}
            </v-icon>
          </template>
          <span>{{ aboutElem[i].tooltip }}</span>
        </v-tooltip>
        <div
            class="divider-tab"
            :style="{background: theme.$primary_button}"
        />
      </v-card-title>
      
      <v-card-text
          :is="`dash-${i}`"
          v-for="i in elements"
          v-show="aboutElem[i].show"
          :key="i"
          :idFrom="i"
          :colorFrom="theme"
          :activeElemFrom="activeElem"
          idDashFrom="reports"
          :widthFrom="size.width"
          :heightFrom="size.height"
          :timeFormatFrom="''"
          :sizeTileFrom="{width: '', height: ''}"
          :searchRep="true"
          :tooltipFrom="tooltipSvg"
          :shouldGet="shouldGet"
          :dataReport="true"
          :dataRestFrom="data"
      />
    </div>
</template>


<script>
import { mdiRefresh, mdiMagnify } from '@mdi/js'
import settings from "../../js/componentsSettings";

export default {
  props: {
    data: [],
    // size: {},
    shouldGet: null,
  },
  data () {
    return {
      aboutElem: {},
      activeElem: 'table',
      tooltipSvg:  { "texts": [], "links": [], "buttons": [] },
      mdiRefresh: mdiRefresh,
      mdiMagnify: mdiMagnify,
      size: {},
    }
  },
  computed: {
    theme () {
      return this.$store.getters.getTheme
    },
    elements () {
      this.$store.getters.getReportElement.forEach( (item,i) => {
        this.$set(this.aboutElem,item,{});
        if (i == 0) {
          this.$set(this.aboutElem[item],'show',true);
          this.$set(this.aboutElem[item],'color',this.theme.controls);
        } else {
          this.$set(this.aboutElem[item],'show',false);
          this.$set(this.aboutElem[item],'color',this.theme.text);
        }
        this.$set(this.aboutElem[item],'tooltip',settings.reports[item].tooltip);
        this.$set(this.aboutElem[item],'icon',settings.reports[item].icon);
        this.$set(this.aboutElem[item],'key',i);
      })
      this.activeElem = 'table';
      return this.$store.getters.getReportElement
    },
  },
  mounted() {
    this.calcSize();
  },
  methods: {
    changeTab (elem) {
      if (elem == 'multiLine'){
        this.unitedShow = true;
      } else {
        this.unitedShow = false;
      }
      Object.keys(this.aboutElem).forEach( item => {
        if (item != elem) {
          this.$set(this.aboutElem[item],'show',false);
          this.$set(this.aboutElem[item],'color',this.theme.text);
        } else {
          this.activeElem = item;
          this.$set(this.aboutElem[item],'show',true);
          this.$set(this.aboutElem[item],'color',this.theme.controls);
        }
      })
    },
    calcSize: function() {
      let size = this.$refs.vis.getBoundingClientRect();
      this.size.width = Math.round(size.width) - 16;
      this.size.height = Math.round(size.height) - 66;
    },
  }
}


</script>

<style lang="scss" >
.visualisation {
  height: 600px;
  width: 100%;
}
</style>