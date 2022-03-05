<template>
  <div
    ref="vis"
    class="visualisation"
    :style="{ background: theme.$main_bg, color: theme.$main_text }"
  >
    <div class="d-flex">
      <v-menu
        offset-y
        width="326"
        class="select"
      >
        <template v-slot:activator="{ on, attrs }">
          <div
            class="select-title"
            v-bind="attrs"
            v-on="on"
          >
            {{ aboutElem[activeElem].tooltip }}
            <v-icon :color="theme.$main_text">{{ mdiChevronDown }}</v-icon>
          </div>
        </template>
        <div class="chart-type-wrap">
          <div class="chart-type-text">
            Выберите тип визуализации
          </div>
          <div class="chart-types">
            <div
                class="chart-type-item"
                v-for="i in elements"
                :key="aboutElem[i].key"
            >
              <v-tooltip
                  bottom
                  :color="theme.$accent_ui_color"
                  @click="changeTab(i)"
              >
                <template
                    v-slot:activator="{ on }"
                    class="p-5"
                >
                  <v-icon
                      class="title-icon"
                      size="60"
                      :color="aboutElem[i].color"
                      v-on="on"
                      @click="changeTab(i)"
                  >
                    {{ aboutElem[i].icon }}
                  </v-icon>
                </template>
                <span>{{ aboutElem[i].tooltip }}</span>
              </v-tooltip>
            </div>
          </div>
        </div>
      </v-menu>
      <v-tooltip
        class="ml-5"
        bottom
        :color="theme.$accent_ui_color"
        :disabled="false"
        :open-delay="false"
      >
        <template v-slot:activator="{ on }">
          <v-icon
            class="option"
            :color="theme.$main_border"
            v-on="on"
            @click="switchOP()"
          >
            {{ mdiSettings }}
          </v-icon>
        </template>
        <span>Настройки</span>
      </v-tooltip>
    </div>
    <v-card-title class="title-vis">
      <div
        class="divider-tab"
        :style="{ background: theme.$primary_button }"
      />
    </v-card-title>

    <v-card-text
      :is="`dash-${i}`"
      v-for="i in elements"
      v-show="aboutElem[i].show"
      :key="i"
      :id-from="i"
      :color-from="theme"
      :active-elem-from="activeElem"
      id-dash-from="reports"
      :width-from="size.width"
      :height-from="size.height"
      :time-format-from="''"
      :size-tile-from="{ width: '', height: '' }"
      :search-rep="true"
      :tooltip-from="tooltipSvg"
      :should-get="shouldGet"
      :data-report="true"
      :data-rest-from="data"
    />
    <modal-settings
      :color-from="theme"
      id-dash-from="reports"
    />
  </div>
</template>

<script>
import {
  mdiRefresh, mdiMagnify, mdiChevronDown, mdiSettings,
} from '@mdi/js';
import settings from '../../js/componentsSettings';

export default {
  props: {
    data: Array,
    // size: {},
    shouldGet: null,
  },
  data() {
    return {
      aboutElem: {},
      activeElem: 'table',
      tooltipSvg: { texts: [], links: [], buttons: [] },
      mdiRefresh,
      mdiMagnify,
      mdiChevronDown,
      mdiSettings,
      size: {
        width: 1000,
        height: 500,
      },
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    elements() {
      this.$store.getters.getReportElement.forEach((item, i) => {
        this.$set(this.aboutElem, item, {});
        if (i === 0) {
          this.$set(this.aboutElem[item], 'show', true);
          this.$set(this.aboutElem[item], 'color', this.theme.controls);
        } else {
          this.$set(this.aboutElem[item], 'show', false);
          this.$set(this.aboutElem[item], 'color', this.theme.text);
        }
        this.$set(
          this.aboutElem[item],
          'tooltip',
          settings.reports[item].tooltip,
        );
        this.$set(this.aboutElem[item], 'icon', settings.reports[item].icon);
        this.$set(this.aboutElem[item], 'key', i);
      });
      this.setActiveElem('table');
      return this.$store.getters.getReportElement;
    },
  },
  mounted() {
    this.calcSize();
  },
  methods: {
    changeTab(elem) {
      this.unitedShow = elem === 'multiLine';
      Object.keys(this.aboutElem).forEach((item) => {
        if (item !== elem) {
          this.$set(this.aboutElem[item], 'show', false);
          this.$set(this.aboutElem[item], 'color', this.theme.text);
        } else {
          this.setActiveElem(item);
          this.$set(this.aboutElem[item], 'show', true);
          this.$set(this.aboutElem[item], 'color', this.theme.controls);
        }
      });
    },
    calcSize() {
      const size = this.$refs.vis.getBoundingClientRect();
      this.size.width = Math.round(size.width) - 16;
    },
    setActiveElem(elemName) {
      this.activeElem = elemName;
    },
    switchOP() {
      this.$store.dispatch('openModalSettings', {
        path: 'reports',
        element: this.activeElem,
        titles: this.data[0] ? Object.keys(this.data[0]) : [],
      });
    },
  },
};
</script>

<style lang="sass" scoped>
@import "../../sass/_colors"
.visualisation
  position: relative
  width: 100%
  min-height: 500px
  .select-title
    font-weight: 600
    font-size: 12px
    padding-left: 15px
  .option
    margin-left: 30px
.chart-type-wrap
  width: 326px
  padding: 30px 10px 30px 20px
  background-color: $main_bg
  .chart-type-text
    font-weight: 600
    font-size: 12px
    margin-bottom: 10px
    color: $main_text
  .chart-types
    display: flex
    flex-flow: row wrap
    .chart-type-item
      width: 64px
      height: 64px
      margin-right: 10px
      margin-bottom: 10px
      background: $secondary_bg
      border: 1px solid $secondary_border
      border-radius: 8px
      padding: 1px
      &:hover
        padding: 0
        background: rgba(6, 154, 238, 0.2)
        border: 2px solid $primary_button
      .title-icon
        width: 60px
        height: 60px
        padding: 10px
        color: $primary_button
</style>
