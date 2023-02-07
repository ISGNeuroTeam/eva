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
            <h3 class="mt-4">
              Цвет положительного бара
            </h3>
          </v-col>
          <v-col cols="6 pb-0">
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
            <h3 class="mt-4">
              Цвет отрицательного бара
            </h3>
          </v-col>
          <v-col cols="6 pb-0">
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
            <h3 class="mt-4">
              Цвет суммарного бара
            </h3>
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
            <h3 class="mt-4">
              Наклон подписей оси X
            </h3>
          </v-col>
          <v-col>
            <v-switch
              v-model="options.xLabelRotate"
              @change="isChanged = true"
            />
          </v-col>
        </v-row>

        <h2 class="my-4">
          Замена заголовков
        </h2>
        <div
          v-for="(item, i) of titleReplace"
          :key="item.old"
          class="title-replace-item mb-2 pa-2"
          :class="{
            'has-error': checkTitleReplaceError(item),
          }"
        >
          <v-row>
            <v-col>
              <v-autocomplete
                v-model="item.old"
                :items="titles.filter(title => item.old === title
                  || !titleReplace.map(d => d.old).includes(title))"
                class="field-profile"
                label="Заменить с"
                :style="{ color: theme.$main_text }"
                outlined
                hide-details
                dense
              />
            </v-col>
            <v-col class="pl-0">
              <v-text-field
                v-model="item.to"
                :color="theme.$accent_ui_color"
                :style="{ color: theme.$main_text }"
                class="textarea-item"
                outlined
                label="Заменить на"
                hide-details
                dense
              />
            </v-col>
            <v-col class="flex-grow-0 pl-0">
              <v-btn
                icon
                color="red"
                class="mt-1"
                @click="removeTitleReplaceItem(i)"
              >
                <v-icon>{{ icons.mdiDelete }}</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </div>

        <div class="justify-center mt-3">
          <v-btn
            small
            plain
            :color="theme.$primary_button"
            :disabled="titleReplace.length > 20"
            @click="addTitleReplace()"
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
      colorText: '#ffffff',
      colorLabel: null,
      colorBarPositive: '#00dd00',
      colorBarNegative: '#dd0000',
      colorBarTotal: '#999999',
      xLabelRotate: true,
    },
    titles: [],
    titleReplace: [],
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
      const chartOptions = { ...this.options };
      chartOptions.titleReplace = this.titleReplace
        .filter((item) => !this.checkTitleReplaceError(item));
      this.$emit('save', chartOptions);
      this.close(true);
    },

    initOptions() {
      Object.keys(this.receivedSettings).forEach((param) => {
        if (['titles', 'titleReplace'].includes(param)) {
          this.$set(this, param, structuredClone(this.receivedSettings[param]));
        } else {
          this.options[param] = this.receivedSettings[param];
        }
      });
    },

    close() {
      this.$emit('close');
    },

    addTitleReplace() {
      this.titleReplace.push({
        old: '',
        to: '',
      });
    },

    removeTitleReplaceItem(idx) {
      this.isChanged = true;
      this.titleReplace.splice(idx, 1);
    },

    checkTitleReplaceError({ old, to }) {
      return old === '' || to === '';
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
.title-replace-item
  border: 1px solid $main_border
  border-radius: 3px
  &.has-error
    border-color: #bd0000
    background-color: #f002
</style>
