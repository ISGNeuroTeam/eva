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
        <h4>Настройки по умолчанию</h4>
        <v-text-field
          v-model="options.metricName"
          class="mb-6 mt-2"
          outlined
          label="Название метрики"
          hide-details
          dense
        />
        <h4>Цвет шкалы</h4>
        <div
          v-for="(item, i) in zones"
          :key="i"
          class="zone-item mt-2"
        >
          <v-row>
            <v-col cols="4">
              <v-text-field
                v-model="item.max"
                class="ma-2"
                outlined
                label="Максимум"
                hide-details
                type="number"
                dense
              />
            </v-col>
            <v-col>
              <v-color-picker
                v-model="item.color"
                hide-inputs
                hide-sliders
                width="50"
                canvas-height="50"
                flat
                class="picker float-left mt-1"
              />
              <v-color-picker
                v-model="item.color"
                hide-inputs
                hide-canvas
                width="250"
                canvas-height="50"
                flat
                class="picker"
              />
            </v-col>
            <v-col cols="2">
              <div class="ma-2">
                <v-btn
                  icon
                  color="red"
                  class="ml-3"
                  @click="removeZone(i)"
                >
                  <v-icon>{{ icons.mdiDelete }}</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </div>
        <div class="justify-center mt-3">
          <v-btn
            small
            plain
            :color="theme.$primary_button"
            :disabled="zones.length > 9"
            @click="addZone()"
          >
            <v-icon left>
              {{ icons.mdiPlus }}
            </v-icon>
            Добавить зону
          </v-btn>
        </div>
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
  name: 'DashGaugeSettings',
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
      metricName: '',
    },
    isChanged: false,
    zones: [],
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
      } else {
        this.isChanged = false;
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
      this.zones = this.zones
        .map(({ color, max }) => ({ color: `${color}`, max: +max }))
        // eslint-disable-next-line no-nested-ternary
        .sort((a, b) => ((a.max > b.max) ? 1 : (a.max < b.max) ? -1 : 0));
      this.$emit('save', {
        ...this.options,
        zones: this.zones,
      });
      this.close(true);
    },

    initOptions() {
      if (this.receivedSettings.metricName) {
        this.options.metricName = `${this.receivedSettings.metricName}`;
      }
      if (this.receivedSettings.zones) {
        this.zones = this.receivedSettings.zones.map(({ color, max }) => ({ color: `${color}`, max: +max }));
      }
    },

    close() {
      this.$emit('close');
    },

    colorPickerInputChange() {
      this.colorPickerInputMode = !this.colorPickerInputMode;
    },

    removeZone(idx) {
      this.zones.splice(idx, 1);
    },

    addZone() {
      this.zones.push({ color: '#ff0000', max: 100 });
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
