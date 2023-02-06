<template>
  <modal-persistent
    ref="confirmModal"
    v-model="isOpen"
    :theme="theme"
    width="560"
    scrollable
    :is-confirm="isChanged"
    :persistent="isChanged"
    :dark="isDarkTheme"
    @cancelModal="close"
    @keydown.esc="close"
  >
    <v-card class="dialog-content">
      <v-card-title class="header">
        <span class="main-title">Настройка визуализации</span>
      </v-card-title>
      <v-card-text class="content groups-multiline-settings">

        <v-row>
          <v-col cols="6 pr-0">
            <h3 class="mt-4">Цвет положительного бара</h3>
          </v-col>
          <v-col cols="6">
            <v-color-picker
              v-model="options.colorBarPositive"
              hide-inputs
              hide-sliders
              width="50"
              canvas-height="50"
              flat
              class="picker float-left mt-1"
              @change="isChanged = true"
            />
            <v-color-picker
              v-model="options.colorBarPositive"
              hide-inputs
              hide-canvas
              width="250"
              canvas-height="50"
              flat
              class="picker"
              @change="isChanged = true"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6 pr-0">
            <h3 class="mt-4">Цвет отрицательного бара</h3>
          </v-col>
          <v-col cols="6">
            <v-color-picker
              v-model="options.colorBarNegative"
              hide-inputs
              hide-sliders
              width="50"
              canvas-height="50"
              flat
              class="picker float-left mt-1"
              @change="isChanged = true"
            />
            <v-color-picker
              v-model="options.colorBarNegative"
              hide-inputs
              hide-canvas
              width="250"
              canvas-height="50"
              flat
              class="picker"
              @change="isChanged = true"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6 pr-0">
            <h3 class="mt-4">Цвет суммарного бара</h3>
          </v-col>
          <v-col cols="6">
            <v-color-picker
              v-model="options.colorBarTotal"
              hide-inputs
              hide-sliders
              width="50"
              canvas-height="50"
              flat
              class="picker float-left mt-1"
              @change="isChanged = true"
            />
            <v-color-picker
              v-model="options.colorBarTotal"
              hide-inputs
              hide-canvas
              width="250"
              canvas-height="50"
              flat
              class="picker"
              @change="isChanged = true"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <h3 class="mt-4">Наклон подписей оси X</h3>
          </v-col>
          <v-col>
            <v-switch
              v-model="options.xLabelRotate"
              @change="isChanged = true"
            />
          </v-col>
        </v-row>

      </v-card-text>

      <v-card-actions class="footer pr-3 d-flex justify-end px-6">
        <v-btn
          text
          depressed
          class="btn-cancel"
          dark
          :color="theme.$primary_button"
          @click="close"
        >
          Отмена
        </v-btn>
        <v-btn
          depressed
          class="btn-save"
          dark
          :color="theme.$primary_button"
          @click="save"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </modal-persistent>
</template>

<script>
import {
  mdiPalette,
  mdiDelete,
  mdiPlus,
} from '@mdi/js';
import { mapGetters } from 'vuex';

export default {
  name: 'DashWaterfallSettings',
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    modalValue: {
      type: Boolean,
      default: false,
    },
    receivedSettings: {
      required: true,
      type: Object,
    },
    icons: {
      type: Object,
      default: () => ({
        mdiPalette,
        mdiDelete,
        mdiPlus,
      }),
    },
  },
  data: () => ({
    options: {
      title: '',
      colorText: '#ffffff',
      colorLabel: null,
      colorBarPositive: '#00dd00',
      colorBarNegative: '#dd0000',
      colorBarTotal: '#999999',
      xLabelRotate: true,
    },
    isChanged: false,
  }),
  computed: {
    ...mapGetters({
      theme: 'getTheme',
      themeTitle: 'getThemeTitle',
    }),
    isDarkTheme() {
      return this.themeTitle.indexOf('light') === -1;
    },
    isOpen: {
      get() {
        return this.modalValue;
      },
      set(val) {
        this.panelMetric = [];
        this.$emit('updateModalValue', val);
      },
    },
  },
  watch: {
    isOpen(val) {
      if (val) {
        this.initOptions();
      }
    },
    receivedSettings() {
      this.initOptions();
    },
  },
  mounted() {
    this.initOptions();
  },
  methods: {
    save() {
      this.$emit('save', {
        ...this.options,
      });
      this.close(true);
    },

    initOptions() {
      this.options = { ...this.receivedSettings };
      console.log(this.options);
    },

    close() {
      this.$emit('close');
    },
  },
};
</script>

<style lang="sass" scoped>
@import ../../../sass/_colors
.dialog-content::v-deep,
.v-color-picker
  background-color: $main_bg !important
.zone-item
  border: 1px solid $main_border
  border-radius: 3px
  margin: 4px 0
.picker::v-deep
  .v-color-picker__controls
    padding: 12px
</style>
