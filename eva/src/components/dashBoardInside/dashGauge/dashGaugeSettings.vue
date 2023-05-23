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
          @change="isChanged = true"
        />
        <h4>Цвет шкалы</h4>
        <div
          v-for="(item, i) in zones"
          :key="i"
          class="zone-item mt-2"
          :class="{
            'has-error': checkZoneError(item)
          }"
        >
          <v-row>
            <v-col cols="3">
              <v-text-field
                v-model="item.min"
                class="mt-2 ml-2"
                outlined
                label="От"
                hide-details
                type="number"
                dense
                @change="onChangeMinZoneValue($event, i)"
              />
            </v-col>
            <v-col cols="2 px-0">
              <v-text-field
                v-model="item.max"
                class="mt-2"
                outlined
                label="До"
                hide-details
                type="number"
                dense
                @change="onChangeMaxZoneValue($event, i)"
              />
            </v-col>
            <v-col cols="5 pr-0">
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
            <v-col>
              <div class="mt-2">
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
      this.isChanged = false;
      this.zones = this.zones
        .filter((item) => !this.checkZoneError(item))
        .map(({ color, min, max }) => ({ color: `${color}`, min: +min, max: +max }))
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
        this.zones = this.receivedSettings.zones
          .map(({ color, min, max }) => ({ color: `${color}`, min: +min, max: +max }));
      }
    },

    close() {
      this.$emit('close');
    },

    removeZone(idx) {
      this.isChanged = true;
      if (idx > 0 && idx < this.zones.length - 1) {
        this.zones[idx - 1].max = this.zones[idx + 1].min;
      }
      this.zones.splice(idx, 1);
    },

    addZone() {
      this.isChanged = true;
      const min = this.zones.length ? this.zones[this.zones.length - 1].max : 0;
      this.zones.push({ color: '#ff0000', min: `${min}`, max: `${+min + 100}` });
    },

    onChangeMinZoneValue(val, i) {
      this.isChanged = true;
      if (i > 0) {
        this.zones[i - 1].max = val;
      }
    },

    onChangeMaxZoneValue(val, i) {
      this.isChanged = true;
      if (i < this.zones.length - 1) {
        this.zones[i + 1].min = val;
      }
    },

    checkZoneError({ min, max }) {
      if (min === '' || max === '') {
        return true;
      }
      return +min >= +max;
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
  padding-bottom: 2px
  &.has-error::v-deep
    border-color: #bd0000
    background-color: #f002
    .v-text-field__slot input
      color: red
    .picker
      .v-color-picker__controls
        background-color: #f002
.picker::v-deep
  .v-color-picker__controls
    padding: 12px
</style>
