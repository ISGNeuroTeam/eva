<template>
  <v-dialog
    v-if="visualisationModal"
    :value="visualisationModal.open"
    width="100%"
    @click:outside="visualisationModal = {}"
  >
    <v-card :style="{ background: theme.$main_bg }">
      <v-card-title class="card-title">
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
          <visualisation
            space-name="modal"
            :element="visualisationModal.tool"
            :data="data"
            :mode="mode"
          />
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { mdiSettings, mdiClose } from '@mdi/js';

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
};
</script>

<style lang="scss" scoped>
  .card-title {
    display: flex;
    justify-content: end;
  }
</style>
