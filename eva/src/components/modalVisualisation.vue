<template>
  <v-dialog
      v-if="visualisationModal"
      :value="visualisationModal.open"
      width="100%"
      @click:outside="visualisationModal = {}"
    >
    <v-card :style="{ background: theme.$main_bg }">
    <v-card-title>
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
            {{ settings_icon }}
          </v-icon>
        </template>
        <span>Настройки</span>
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
import { mdiSettings } from '@mdi/js';

import Visualisation from './visualisation.vue';
export default {
  components: { Visualisation },
  name: 'modalVisualisation',

  props: {
    getElementData: {
      type: Function,
    },
    mode: Boolean
  },
  data: () => ({
    settings_icon: mdiSettings,
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
        return this.$store.state[this.idDash].visualisationModalData
      },
      set(newVal) {
        this.$store.commit('setVisualisationModalData', {idDash: this.idDash, data: newVal})
      }     
    },
    data() {
      return this.getElementData(this.visualisationModal.search || {})
    }
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
}
</script>

<style>

</style>