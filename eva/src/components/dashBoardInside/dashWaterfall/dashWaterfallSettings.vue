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
              Цвет положительного столбика
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
              @update:color="isChanged = true"
            />
            <v-color-picker
              v-model="options.colorBarPositive"
              hide-inputs
              hide-canvas
              width="250"
              canvas-height="50"
              flat
              class="picker"
              @update:color="isChanged = true"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6 pr-0">
            <h3 class="mt-4">
              Цвет отрицательного столбика
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
              @update:color="isChanged = true"
            />
            <v-color-picker
              v-model="options.colorBarNegative"
              hide-inputs
              hide-canvas
              width="250"
              canvas-height="50"
              flat
              class="picker"
              @update:color="isChanged = true"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="6 pr-0">
            <h3 class="mt-4">
              Цвет суммарного столбика
            </h3>
          </v-col>
          <v-col cols="6 pb-0">
            <v-color-picker
              v-model="options.colorBarTotal"
              hide-inputs
              hide-sliders
              width="50"
              canvas-height="50"
              flat
              class="picker float-left mt-1"
              @update:color="isChanged = true"
            />
            <v-color-picker
              v-model="options.colorBarTotal"
              hide-inputs
              hide-canvas
              width="250"
              canvas-height="50"
              flat
              class="picker"
              @update:color="isChanged = true"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <h3 class="mt-4">
              Наклон подписей оси X
            </h3>
          </v-col>
          <v-col class="pb-0">
            <v-switch
              v-model="options.xLabelRotate"
              hide-details
              @change="isChanged = true"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <h3 class="mt-4">
              Заменить цвет значений
            </h3>
          </v-col>
          <v-col>
            <v-switch
              v-model="coloredTotal"
              hide-details
              @change="isChanged = true"
            />
          </v-col>
        </v-row>
        <v-row v-if="options.colorText">
          <v-col cols="6 pr-0">
            <h3 class="mt-4">
              Цвет значений столбика
            </h3>
          </v-col>
          <v-col cols="6">
            <v-color-picker
              v-model="options.colorText"
              hide-inputs
              hide-sliders
              width="50"
              canvas-height="50"
              flat
              class="picker float-left mt-1"
              @update:color="isChanged = true"
            />
            <v-color-picker
              v-model="options.colorText"
              hide-inputs
              hide-canvas
              width="250"
              canvas-height="50"
              flat
              class="picker"
              @update:color="isChanged = true"
            />
          </v-col>
        </v-row>

        <h2 class="mb-4 mt-6">
          Настройки столбиков
        </h2>
        <div
          v-for="(item, i) of barsOptions"
          :key="item.title"
          class="title-replace-item mb-2 pa-2"
          :class="{
            'has-error': checkTitleReplaceError(item),
          }"
        >
          <v-row>
            <v-col>
              <v-autocomplete
                v-model="item.title"
                :items="titles.filter(title => item.title === title
                  || !barsOptions.map(d => d.title).includes(title))"
                class="field-profile"
                label="Столбец"
                :style="{ color: theme.$main_text }"
                outlined
                hide-details
                dense
              />
              <v-text-field
                v-model="item.newTitle"
                :color="theme.$accent_ui_color"
                :style="{ color: theme.$main_text }"
                class="textarea-item mt-3"
                outlined
                label="Подпись столбца"
                hide-details
                dense
                @update:color="isChanged = true"
              />
              <v-checkbox
                v-model="item.changeColor"
                label="Заменить цвет столбика"
                persistent-placeholder
                dense
                outlined
                hide-details
                color="blue"
                @update:color="isChanged = true"
              />
            </v-col>
            <v-col class="pl-0">
              <v-color-picker
                v-model="item.color"
                :disabled="!item.changeColor"
                hide-inputs
                width="230"
                canvas-height="70"
                flat
                class="picker"
                @update:color="isChanged = true"
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
            :disabled="barsOptions.length > 30"
            @click="addTitleReplace()"
          >
            <v-icon left>
              {{ icons.mdiPlus }}
            </v-icon>
            Добавить
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
      colorText: null,
      colorLabel: null,
      colorBarPositive: '#00dd00',
      colorBarNegative: '#dd0000',
      colorBarTotal: '#999999',
      xLabelRotate: true,
    },
    titles: [],
    barsOptions: [],
    isChanged: false,
  }),
  computed: {
    ...mapGetters({
      theme: 'getTheme',
      themeTitle: 'getThemeTitle',
    }),
    coloredTotal: {
      get() {
        return this.options.colorText !== null;
      },
      set(val) {
        this.options.colorText = val ? '#00FF00' : null;
      },
    },
    isDarkTheme() {
      return this.themeTitle.indexOf('light') === -1;
    },
    isOpen: {
      get() {
        return this.modalValue;
      },
      set(val) {
        this.$emit('updateModalValue', val);
      },
    },
  },
  watch: {
    isOpen(val) {
      if (val) {
        this.isChanged = false;
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
      chartOptions.barsOptions = this.barsOptions
        .filter((item) => !this.checkTitleReplaceError(item));
      this.$emit('save', chartOptions);
      this.close(true);
    },

    initOptions() {
      Object.keys(this.receivedSettings).forEach((param) => {
        if (['titles', 'barsOptions'].includes(param)) {
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
      this.barsOptions.push({
        title: '',
        newTitle: '',
        changeColor: false,
        color: '#FF0000',
      });
    },

    removeTitleReplaceItem(idx) {
      this.isChanged = true;
      this.barsOptions.splice(idx, 1);
    },

    checkTitleReplaceError({ title, newTitle, changeColor }) {
      return (title === null || title === '') || (newTitle === '' && !changeColor);
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
.title-replace-item::v-deep
  border: 1px solid $main_border
  border-radius: 3px
  &.has-error
    border-color: #bd0000
    background-color: #f002
    .picker
      .v-color-picker__controls
        background-color: #f002
</style>
