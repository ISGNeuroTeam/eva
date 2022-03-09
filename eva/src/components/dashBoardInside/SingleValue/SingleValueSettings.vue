<template>
  <modal-persistent
    ref="confirmModal"
    v-model="isOpen"
    :theme="theme"
    width="560"
    scrollable
    :is-confirm="isChanged"
    :persistent="isChanged"
    @cancelModal="close"
  >
    <v-card class="dialog-content">
      <v-card-title class="header">
        <v-icon
          left
          class="icon-main"
          v-text="mdiSettings"
        />
        <span class="main-title">Настройки Single Value</span>
        <v-icon
          right
          class="icon-close"
          @click="close"
          v-text="mdiClose"
        />
      </v-card-title>

      <v-divider :color="theme.$secondary_border" />

      <v-card-text class="content pa-0">
        <div class="content-section">
          <span class="section-title">Название</span>
          <v-text-field
            v-model="settings.title"
            dense
            outlined
            hide-details
            class="input-element"
            @input="isChanged = true"
          />
          <br>
          <label class="checkbox-google">
            <input
              type="checkbox"
              :checked="settings.showTitle || false"
              @change="handleChangeShowTitle"
            >
            <span class="checkbox-google-switch" /> &nbsp; Отображение
            шапки компонента
          </label>
        </div>

        <div class="content-section offset">
          <span class="section-title">Количество показателей</span>
          <v-select
            :items="metricCountList"
            :append-icon="mdiChevronDown"
            dense
            outlined
            :value="settings.metricCount"
            hide-details
            menu-props="offsetY"
            class="input-element"
            @change="handleChangeCount"
            @input="isChanged = true"
          />
        </div>

        <div
          v-if="settings.metricCount > 1"
          class="content-section pt-0"
        >
          <span class="section-title bold">Выберите шаблон</span>
          <div class="templates-container">
            <div
              v-for="n in templatesForMetrics[settings.metricCount]"
              :key="`data-template-${n}`"
              class="data-template"
              :class="`metric-${settings.metricCount} v-${n} ${
                n === settings.template ? 'selected' : ''
              }`"
              @click="settings.template = n"
            >
              <div
                v-for="n in settings.metricCount"
                :key="`item-${n}`"
                class="item"
                :style="{ gridArea: `item-${n}` }"
                v-text="n"
              />
            </div>
          </div>
        </div>

        <div class="content-section style-settings-header">
          <span class="section-title">Настройка стилей</span>
          <span
            class="show-all-title"
            @click="showAllMetrics"
            v-html="showAllTitle"
          />
        </div>
        <draggable
          v-model="settings.metricOptions"
          handle=".burger"
          @end="update()"
        >
          <div
            v-for="(metric, i) in settings.metricOptions"
            :key="`metric-${metric.listOrder}`"
            class="metric-section"
            :class="{ expanded: metric.expanded }"
          >
            <div class="metric-header">
              <span
                class="title-wrapper"
                @click="metric.expanded = !metric.expanded"
              >
                <span class="metric-title">
                  Показатель {{ i + 1 }} -
                  {{ !metric.title ? 'Нет подписи' : metric.title }}
                </span>
                <v-icon
                  size="26"
                  class="mx-1"
                  :color="theme.$accent_ui_color"
                  v-text="metric.expanded ? mdiChevronUp : mdiChevronDown"
                />
              </span>
              <v-icon
                size="16"
                class="burger"
                style="cursor: move"
                :color="theme.$main_border"
                v-text="mdiMenu"
              />
            </div>

            <div class="content-section">
              <span class="section-title">Подпись (необязательно)</span>
              <v-text-field
                v-model="metric.title"
                dense
                outlined
                hide-details
                class="input-element"
                @input="isChanged = true"
              />
            </div>

            <div class="content-section">
              <span class="section-title">Иконка подписи (необязательно)</span>
              <div class="icons-container">
                <div
                  title="Без иконки"
                  class="icon"
                  :class="{ selected: no_icon.id === metric.icon }"
                  @click="metric.icon = no_icon.id; isChanged = true"
                  v-html="no_icon.svg"
                />
                <div
                  v-for="icon in iconList"
                  :key="icon.id"
                  class="icon"
                  :class="{ selected: icon.id === metric.icon }"
                  @click="metric.icon = icon.id; isChanged = true"
                  v-html="icon.svg"
                />
              </div>
            </div>

            <div class="content-section font-selects-box">
              <div class="content-section pa-0">
                <span class="section-title">Размер шрифта (px)</span>
                <v-select
                  v-model="metric.fontSize"
                  :items="fontSizeList"
                  :append-icon="mdiChevronDown"
                  dense
                  outlined
                  hide-details
                  menu-props="offsetY"
                  class="input-element"
                  @input="isChanged = true"
                />
              </div>
              <div class="content-section pa-0">
                <span class="section-title">Насыщенность шрифта</span>
                <v-select
                  v-model="metric.fontWeight"
                  :items="fontWeightList"
                  :append-icon="mdiChevronDown"
                  dense
                  outlined
                  hide-details
                  menu-props="offsetY"
                  class="input-element"
                  @input="isChanged = true"
                >
                  <template v-slot:selection="{ item }">
                    {{
                      item.title
                    }}
                  </template>
                  <template v-slot:item="{ item }">
                    <span
                      :style="{
                        fontWeight: item.value,
                        fontFamily: getFamily(item),
                      }"
                      v-text="item.title"
                    />
                  </template>
                </v-select>
              </div>
            </div>

            <div class="content-section">
              <span class="section-title">Цвет шрифта</span>
              <div class="color-selects-box">
                <div
                  v-for="color in colorsList"
                  :key="color.name"
                  class="color-select"
                  :class="{ selected: metric.color === color.name }"
                  @click="metric.color = color.name; isChanged = true"
                >
                  <div
                    v-if="color.colorGrad"
                    :class="{ 'gradient-style': color.colorGrad }"
                    :style="{
                      background: color.colorGrad,
                    }"
                    v-text="color.title"
                  />
                  <div
                    v-else
                    :style="{ color: getColor(color.name) }"
                    v-text="color.title"
                  />
                </div>
              </div>
            </div>
          </div>
        </draggable>
      </v-card-text>

      <v-divider :color="theme.$secondary_border" />

      <v-card-actions class="footer px-6">
        <v-btn
          text
          depressed
          class="btn-cancel"
          @click="close"
        >
          Отмена
        </v-btn>
        <v-btn
          depressed
          class="btn-save"
          @click="save"
        >
          Сохранить
        </v-btn>
      </v-card-actions>
    </v-card>
  </modal-persistent>

</template>

<script>
import draggable from 'vuedraggable';
import {
  mdiMenu,
  mdiClose,
  mdiSettings,
  mdiChevronUp,
  mdiChevronDown,
} from '@mdi/js';
import metricTitleIcons, { no_icon } from './metricTitleIcons';
import './sass/checkboxGoogle.css';

export default {
  name: 'SingleValueSettings',
  comments: {
    draggable,
  },
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    modalValue: { type: Boolean, default: false },
    receivedSettings: { type: Object, default: () => ({}) },
    updateCount: Function,
  },
  data: () => ({
    no_icon,
    mdiMenu,
    mdiClose,
    mdiSettings,
    mdiChevronUp,
    mdiChevronDown,
    /** Local settings object based on receivedSettings props. */
    settings: {},
    /** Font size select items. */
    fontSizeList: [12, 16, 18, 24, 28, 32, 36, 42, 48, 54, 62, 68, 72],
    /** Font weight select items. */
    fontWeightList: [
      { value: 100, title: 'Thin (100)' },
      { value: 200, title: 'Light (200)' },
      { value: 400, title: 'Regular (400)' },
      { value: 500, title: 'Medium (500)' },
      { value: 800, title: 'Bold (800)' },
    ],
    /** Metric title color select items. */
    colorsList: [
      { name: 'main', title: 'Основной' },
      { name: 'secondary', title: 'Дополнительный' },
      {
        name: 'range',
        title: 'Диапазоны',
        colorGrad:
          'linear-gradient(270.08deg, #FF5147 1.92%, #FFE065 53.99%, #5BD97A 99.93%)',
      },
    ],
    /**
     * The number of available templates for the selected number of metrics.
     * Data fornat: { <metricsNumber>: <availableTemplatesNumber> }.
     */
    templatesForMetrics: {
      2: 2, 3: 6, 4: 7, 5: 4, 6: 2,
    },
    isChanged: false,
  }),
  computed: {
    isOpen: {
      get() {
        return this.modalValue;
      },
      set(val) {
        this.$emit('updateModalValue', val);
      },
    },

    theme() {
      return this.$store.getters.getTheme;
    },

    iconList() {
      return metricTitleIcons.filter((icon) => icon.id !== 'no_icon');
    },

    showAllTitle() {
      return this.isAllMetricsExpanded ? 'Скрыть все' : 'Показать все';
    },

    isAllMetricsExpanded() {
      const { metricOptions = [] } = this.settings;
      return metricOptions.every((m) => m.expanded === true);
    },

    metricCountList() {
      const { metricOptions = [] } = this.settings;
      const metricCount = metricOptions.length;
      const countList = [];

      if (metricCount > 0) {
        const max = metricCount <= 6 ? metricCount : 6;
        for (let i = 0; i < max; i++) {
          countList.push(i + 1);
        }
      }

      return [1, 2, 3, 4, 5, 6];
    },
  },
  watch: {
    isOpen(val) {
      if (!val) {
        this.isChanged = false;
      }
    },
    receivedSettings(newValue) {
      const newSettings = JSON.parse(JSON.stringify(newValue));
      this.settings = {
        ...newSettings,
        metricOptions: newSettings.metricOptions.sort(
          (a, b) => a.listOrder - b.listOrder,
        ),
      };
    },
    settings(newSet, old) {
      if (this.updateCount && old.metricCount !== newSet.metricCount) {
        this.updateCount(this.settings.metricCount);
      }
    },
  },
  methods: {
    changeColorData(metric, color) {
      if (color.name !== 'range' || (color.name === 'range' && metric.metadata)) metric.color = color.name;
    },
    getFamily() {},
    handleChangeShowTitle() {
      if (this.settings) {
        this.isChanged = true;
        this.settings = {
          ...JSON.parse(JSON.stringify(this.settings)),
          showTitle: !this.settings.showTitle,
        };
      }
    },

    getColor(name) {
      return {
        secondary: this.theme.$secondary_text,
        main: this.theme.$blue,
      }[name];
    },

    save() {
      this.$emit('save', { ...this.settings });
      this.close(true);
    },

    handleChangeCount(count) {
      this.settings.template = 1;
      this.settings.metricCount = count;
    },

    update() {
      // this.$emit("save", { ...this.settings });
    },

    close(save = false) {
      if (!save || typeof save === 'object') {
        this.settings = JSON.parse(JSON.stringify(this.receivedSettings));
      }
      this.toggleAllMetrics(false);
      this.$emit('close');
    },

    showAllMetrics() {
      if (this.isAllMetricsExpanded) {
        this.toggleAllMetrics(false);
      } else {
        this.toggleAllMetrics(true);
      }
    },

    toggleAllMetrics(value = true) {
      const { metricOptions = [] } = this.settings;
      for (const metric of metricOptions) {
        metric.expanded = value;
      }
    },
  },
};
</script>

<style lang="sass" scoped>
@import './sass/SingleValueSettings'
</style>
