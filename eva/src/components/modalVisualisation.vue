<template>
  <v-dialog
    v-if="visualisationModal && visualisationModal.open"
    :value="visualisationModal.open"
    width="100%"
    transition="fade-transition"
    @click:outside="visualisationModal = {}"
    @keydown.esc="visualisationModal = {}"
  >
    <v-card :style="{ background: theme.$main_bg }">
      <v-card-title class="card-title">
        <v-tooltip
            v-if="mode && hasZoomIcon"
            bottom
            :color="theme.$accent_ui_color"
            :open-delay="tooltipOpenDelay"
        >
          <template v-slot:activator="{ on }">
            <v-icon
                class="option"
                :color="theme.$main_border"
                v-on="on"
                @click="$refs.viz.sDataRange = null"
            >
              {{ zoomIcon }}
            </v-icon>
          </template>
          <span>Сбросить зум</span>
        </v-tooltip>
        <v-tooltip
          v-if="mode"
          bottom
          :color="theme.$accent_ui_color"
          :open-delay="tooltipOpenDelay"
        >
          <template v-slot:activator="{ on }">
            <v-icon
              class="option"
              :color="theme.$main_border"
              v-on="on"
              @click="switchOP()"
            >
              {{ settingsIcon }}
            </v-icon>
          </template>
          <span>Настройки</span>
        </v-tooltip>
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
              @click="visualisationModal = {}"
            >
              {{ closeIcon }}
            </v-icon>
          </template>
          <span>закрыть</span>
        </v-tooltip>
      </v-card-title>
      <v-card-text>
        <div
          class="full-screen-dialog"
          :style="{ height: '80vh' }"
        >
          <div class="loading-block" >
            <div
              :style="{ borderColor: theme.$main_border, opacity: '0.2' }"
              class="loading-divider"
              :class="{ loading: this.visualisationModal.search && this.data.length === 0 }"
            >
              <div
                class="loading-bar"
                :style="{ background: theme.$primary_button }"
              />
            </div>
          </div>
          <visualisation
            ref="viz"
            :space-name="spaceName"
            :element="visualisationModal.tool"
            :data="data"
            :search-schema="searchSchema"
            :mode="mode"
          />
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import {
  mdiSettings,
  mdiClose,
  mdiMagnifyMinusOutline
} from '@mdi/js';

import Visualisation from './visualisation.vue';

export default {
  name: 'ModalVisualisation',
  components: { Visualisation },

  props: {
    getElementData: {
      type: Function,
      required: true,
    },
    tooltipOpenDelay: {
      type: Number,
      default: 500,
    },
    mode: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    settingsIcon: mdiSettings,
    closeIcon: mdiClose,
    zoomIcon: mdiMagnifyMinusOutline,
    showModal: false,
  }),
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    idDash() {
      // получаем id страницы от родителя
      return this.$route.params.id;
    },
    visualisationModal: {
      get() {
        return this.$store.state[this.idDash].visualisationModalData;
      },
      set(newVal) {
        this.$store.commit('setVisualisationModalData', { idDash: this.idDash, data: newVal });
      },
    },
    data() {
      return this.getElementData(this.visualisationModal.search || {});
    },
    searchSchema() {
      const search = this.$store.state[this.idDash].searches
          .find((element) => element?.sid === this.visualisationModal.search.sid)
      if (search?.schema) return search.schema;
      return {};
    },
    spaceName() {
      const { tool, elemName } = this.visualisationModal;
      return elemName.replace(tool + '-', '');
    },
    hasZoomIcon() {
      return this.visualisationModal && this.visualisationModal.tool.includes('multiLine')
    },
  },
  methods: {
    switchOP() {
      this.$store.dispatch('openModalSettings', {
        path: this.idDash,
        element: this.visualisationModal.elemName,
        titles: this.data[0] ? Object.keys(this.data[0]) : [],
      });
    },
  },
  watch: {
    visualisationModal(){
      if(this.visualisationModal?.search && this.visualisationModal?.runOnOpen){
        this.$store.commit('updateSearchStatus', {
          idDash: this.idDash,
          sid: this.visualisationModal.search.sid,
          status: 'empty',
        });
      }
    }
  }

};
</script>

<style lang="sass" scoped>
  .card-title
    display: flex
    justify-content: flex-end

  .loading-block
    overflow: hidden
    height: 3px
    margin: 0 auto

    .loading-divider
        position: relative
        width: 100%
        border-bottom: 1px solid

        .loading-bar
            position: absolute
            top: 0
            left: 0
            width: 100%
            height: 3px
            transform: translateX(-100%)
            transition: all 0.4s ease

    .loading
        opacity: 0.5 !important

        .loading-bar
            animation: loading 1.5s ease infinite


  @keyframes loading
    from
        transform: translateX(-100%)
    to
        transform: translateX(100%)
</style>
