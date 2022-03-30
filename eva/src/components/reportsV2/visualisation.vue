<template>
  <div
    ref="vis"
    class="visualisation"
    :style="{ background: theme.$main_bg, color: theme.$main_text }"
  >
    <div class="header-settings">
      <v-menu
        v-model="menuDropdown"
        offset-y
        max-width="160"
        class="select"
      >
        <template v-slot:activator="{ on, attrs }">
          <div
            v-bind="attrs"
            v-on="on"
          >
            {{ aboutElem[activeElem].tooltip }}
            <v-icon>{{ mdiChevronDown }}</v-icon>
          </div>
        </template>
        <div style="min-height: 40px">
          <v-tooltip
            v-for="i in elements"
            :key="aboutElem[i].key"
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
      </v-menu>
      <v-tooltip
        bottom
        :color="theme.$accent_ui_color"
        :open-delay="tooltipOpenDelay"
      >
        <template v-slot:activator="{ on }">
          <v-icon
            class="option"
            :color="theme.$main_border"
            v-on="on"
            @click="switchOP"
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
    <template
      v-for="i in elements"
    >
      <v-card-text
        :is="`dash-${i}`"
        v-if="aboutElem[i].show"
        :key="i"
        :id-from="i"
        :color-from="theme"
        :active-elem-from="activeElem"
        :options="getOptions"
        id-dash-from="reports"
        :width-from="size.width"
        :height-from="size.height"
        :time-format-from="''"
        :size-tile-from="{
          width: getOptions ? getOptions.widthTile : '',
          height: getOptions ? getOptions.heightTile : ''
        }"
        :search-rep="true"
        :tooltip-from="tooltipSvg"
        :should-get="shouldGet"
        :data-report="true"
        :data-rest-from="data"
      />
    </template>
    <modal-settings
      v-if="activeSettingModal"
      :color-from="theme"
      :id-dash-from="idDash"
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
    data: {
      type: Array,
      default: () => ([]),
    },
    // size: {},
    shouldGet: {
      type: Boolean,
      required: true,
    },
    tooltipOpenDelay: {
      type: Number,
      default: 500,
    },
  },
  data() {
    return {
      options: {
        visible: true,
        change: false,
        level: 1,
        boxShadow: false,
      },
      modalSettings: false,
      menuDropdown: false,
      aboutElem: {},
      activeElem: 'table',
      tooltipSvg: { texts: [], links: [], buttons: [] },
      mdiRefresh,
      mdiMagnify,
      mdiChevronDown,
      mdiSettings,
      size: {
        width: 500,
        height: 500,
      },
    };
  },
  computed: {
    getOptions() {
      return this.$store.state[this.idDash][this.activeElem].options;
    },
    idDash() {
      return 'reports';
    },
    dashFromStore() {
      if (this.idDash) {
        return this.$store.state[this.idDash];
      }
      return null;
    },
    getModalSettings() {
      if (!this.dashFromStore || !this.dashFromStore.modalSettings) {
        this.$store.commit('setState', [
          {
            object: this.dashFromStore,
            prop: 'modalSettings',
            value: {},
          },
        ]);
        this.$store.commit('setState', [
          {
            object: this.dashFromStore.modalSettings,
            prop: 'element',
            value: '',
          },
          {
            object: this.dashFromStore.modalSettings,
            prop: 'status',
            value: false,
          },
        ]);
      }
      return this.dashFromStore.modalSettings;
    },
    activeSettingModal: {
      get() {
        return this.getModalSettings.status;
      },
      set(value) {
        this.$store.dispatch('closeModalSettings', {
          path: this.idDash,
          status: value,
        });
      },
    },
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
  watch: {
    activeElem() {
      this.calcSize();
    },
  },
  mounted() {
    this.calcSize();
  },
  methods: {
    setOptions() {
      this.$store.commit('setDefaultOptions', { id: this.activeElem, idDash: this.idDash });
    },
    switchOP() {
      this.$store.dispatch('openModalSettings', {
        path: this.idDash,
        element: this.activeElem,
        titles: this.data[0] ? Object.keys(this.data[0]) : [],
      });
    },
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
      this.setOptions();
    },
    calcSize() {
      const size = this.$refs.vis.getBoundingClientRect();
      this.size.width = Math.round(size.width) - 16;
      if (Math.round(size.height) - 66 < 500) {
        this.size.height = 500;
      } else {
        this.size.height = Math.round(size.height) - 66;
      }
    },
    setActiveElem(elemName) {
      this.activeElem = elemName;
    },
  },
};
</script>

<style lang="scss">
.visualisation {
  //height: 600px;
  flex-grow: 1;
  position: relative;
  width: 100%;
}
.header-settings{
  display: flex;
  justify-content: space-between;
}
</style>
