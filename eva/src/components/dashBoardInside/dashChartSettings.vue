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
        <!-- Groups -->
        <div
          v-for="(_, groupNumber) in metricsByGroup"
          :key="groupNumber"
          class="mt-0"
        >
          <div class="section-title text-uppercase">
            Группа {{ groupNumber + 1 }}
          </div>
          <div class="content-section metric-group-content">
            <v-divider :color="theme.$main_bg" />

            <!-- Metrics -->
            <v-expansion-panels
              v-model="panelMetric[groupNumber]"
              flat
            >
              <draggable
                v-model="metricsByGroup[groupNumber]"
                class="v-item-group v-expansion-panels v-expansion-panels--flat"
                group="people"
                handle=".panel-header"
                @start="panelMetric = []"
                @change="(changes) => changeMetricsOrder(groupNumber, changes)"
              >
                <v-expansion-panel
                  v-for="metric in metricsByGroup[groupNumber]"
                  :key="metric.n"
                  class="ma-0"
                >
                  <v-expansion-panel-header class="draggable-item panel-header">
                    <template v-slot:default="{ open }">
                      <div class="title-metric">
                        <v-icon
                          :color="metric.color"
                          class="mr-1"
                        >
                          {{ metric.type === 'barplot' ? mdiChartBar : mdiChartBellCurve }}
                        </v-icon>
                        {{ metric.title }}
                        <span v-if="metric.title">({{ metric.name }})</span>
                        <span v-else>{{ metric.name }}</span>
                        <v-icon>
                          {{ open ? mdiChevronUp : mdiChevronDown }}
                        </v-icon>

                        <span
                          v-if="metric.yAxisLink"
                          class="grey--text ml-2"
                        >📎 {{ metric.yAxisLink }}</span>
                      </div>
                    </template>
                    <template v-slot:actions>
                      <v-icon
                        class="draggable-burger"
                        :color="theme.$main_border"
                        style="cursor: move; transform: none;"
                        @click.stop
                        v-text="mdiMenu"
                      />
                    </template>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content class="panel-content">
                    <!-- forms -->
                    <div class="my-2">
                      <v-text-field
                        v-model="metric.title"
                        label="Название"
                        persistent-placeholder
                        placeholder="Введите название показателя"
                        dense
                        outlined
                        hide-details
                      />

                      <div class="row my-1">
                        <div class="col">
                          <v-autocomplete
                            v-model="metric.type"
                            required
                            :items="metricTypes"
                            value="value"
                            label="Тип графика"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                          />
                        </div>
                        <div class="col">
                          <v-text-field
                            v-model="metric.unit"
                            clearable
                            label="Единица измерения"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                          />
                        </div>
                      </div>

                      <div class="row my-1">
                        <div class="col col-5">
                          <div
                            style="position: relative;"
                            @dblclick="colorPickerInputChange"
                          >
                            <v-tooltip right>
                              <template v-slot:activator="{ on, attrs }">
                                <v-icon
                                  v-bind="attrs"
                                  size="14px"
                                  style="position:absolute;z-index: 2;right: -15px;"
                                  v-on="on"
                                >
                                  {{ mdiHelpCircleOutline }}
                                </v-icon>
                              </template>
                              <span>Двойным кликом переключается режим выбора цвета</span>
                            </v-tooltip>
                            <v-color-picker
                              v-model="metric.color"
                              dot-size="10"
                              :hide-canvas="!colorPickerInputMode"
                              mode="hexa"
                              :hide-inputs="!colorPickerInputMode"
                              width="200"
                              canvas-height="100"
                            />
                          </div>
                        </div>
                        <div
                          v-if="metric.type === 'line'"
                          class="col"
                        >
                          <v-autocomplete
                            v-model="metric.strokeWidth"
                            :items="strokeWidthList"
                            label="Толщина"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                          />
                        </div>
                        <div
                          v-if="metric.type === 'line'"
                          class="col"
                        >
                          <v-autocomplete
                            v-model="metric.strokeDasharray"
                            :disabled="metric.type !== 'line'"
                            :items="strokeDasharrayList"
                            label="Тип линий"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                          />
                        </div>
                      </div>

                      <v-checkbox
                        v-model="metric.hideLegend"
                        label="Скрыть легенду"
                        persistent-placeholder
                        dense
                        outlined
                        hide-details
                        color="blue"
                      />
                      <div class="row mt-0 mb-1">
                        <div
                          class="col col-auto py-0"
                          v-if="metric.type === 'line'"
                        >
                          <v-checkbox
                            v-model="metric.showPeakDots"
                            :disabled="metric.type !== 'line'"
                            label="Отображать точки с данными"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                            color="blue"
                          />
                        </div>
                        <div
                          v-if="metric.type === 'line'"
                          class="col py-0"
                        >
                          <v-slider
                            v-model="metric.dotSize"
                            color="blue"
                            label="Размер"
                            :disabled="!metric.showPeakDots || metric.type !== 'line'"
                            min="2"
                            max="10"
                            thumb-size="25px"
                            thumb-label="always"
                            class="ml-2 mr-1"
                            style="height: 20px;"
                          />
                        </div>
                        <div class="col col-12 py-0">
                          <div class="d-flex">
                            <v-checkbox
                              v-model="metric.showText"
                              class="d-inline-block"
                              label="Отображать подписи"
                              persistent-placeholder
                              dense
                              outlined
                              hide-details
                              color="blue"
                            />
                            <v-btn-toggle
                              v-model="metric.peakTextData"
                              color="blue accent-6"
                              class="d-inline checkbox-toggle-data"
                              dense
                            >
                              <v-btn
                                :disabled="(!metric.showText)"
                                value="data"
                                class="ma-0"
                              >
                                Данные
                              </v-btn>
                              <v-btn
                                :disabled="(!metric.showText)"
                                value="caption"
                                class="ma-0"
                              >
                                Подписи
                              </v-btn>
                            </v-btn-toggle>
                          </div>
                        </div>
                      </div>

                      <div class="row my-1">
                        <div class="col">
                          <v-autocomplete
                            v-model="metric.zerosAfterDot"
                            :disabled="!metric.showText"
                            :items="zerosAfterDotList"
                            label="Округление значений"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                          />
                        </div>
                        <div class="col">
                          <v-text-field
                            v-if="metric.lastDot >= 1 || metric.lastDot === ''"
                            v-model="metric.lastDot"
                            label="Вывод значений"
                            placeholder="Введите число"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                            clearable
                            @keyup.prevent="(e) => {
                              e.target.value = e.target.value.replaceAll(/\D/g, '')
                            }"
                            @input="() => {
                              if (metric.lastDot !== null) {
                                metric.lastDot = metric.lastDot.replaceAll(/\D/g, '');
                              }
                            }"
                          />
                          <v-autocomplete
                            v-else
                            v-model="metric.lastDot"
                            :disabled="!metric.showText"
                            :items="metric.lastDotSearch
                              ? [
                                ...defaultLastDotItems,
                                `${metric.lastDotSearch.replaceAll(/\D/g, '')}`
                              ]
                              : defaultLastDotItems"
                            label="Вывод значений"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                            :search-input.sync="metric.lastDotSearch"
                          />
                        </div>
                      </div>

                      <div
                        v-if="metric.type === 'line'"
                        class="row my-1"
                      >
                        <div class="col">
<!--                          <v-autocomplete
                            v-model="metric.yAxisSide"
                            :items="yAxisSideList"
                            :disabled="metric.type !== 'line'"
                            label="Ось Y"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                          />-->
                          <v-autocomplete
                            v-model="metric.yAxisLink"
                            :items="metricLineList
                              .filter(m => m.group === groupNumber
                                && m.type === 'line'
                                && !m.yAxisLink
                                && m.name !== metric.name
                                && metricLineList
                                  .findIndex(m => m.yAxisLink === metric.name) === -1)
                              .map(m => ({
                                value: m.name,
                                text: `📎 ${m.name}`,
                              }))"
                            :disabled="metric.type !== 'line'"
                            label="Ось Y"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                            no-data-text="Нет подходящих осей"
                            clearable
                          />
                        </div>
                        <div class="col">
                          <v-text-field
                            v-model="metric.lowerBound"
                            :disabled="metric.type === 'barplot'"
                            type="number"
                            clearable
                            :max="metric.upperBound"
                            label="Нижняя граница"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                          />
                        </div>
                        <div class="col">
                          <v-text-field
                            v-model="metric.upperBound"
                            :disabled="metric.type === 'barplot'"
                            type="number"
                            clearable
                            :min="metric.lowerBound"
                            label="Верхняя граница"
                            persistent-placeholder
                            dense
                            outlined
                            hide-details
                          />
                        </div>
                      </div>
                    </div>
                    <!-- /forms -->
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </draggable>
            </v-expansion-panels>
          </div>
        </div>

        <!-- X axis settings -->
        <v-expansion-panels
          v-model="openXAxisPanel"
          flat
        >
          <v-expansion-panel class="ma-0">
            <v-expansion-panel-header class="draggable-item panel-header">
              <div class="text-uppercase v-card__subtitle pa-0 text-secondary">
                Настройки оси X
                <v-divider :color="theme.$main_bg" />
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="panel-content py-3">
              <!-- forms -->
              <div class="row">
                <div class="col-6">
                  <v-select
                    v-model="xAxis.type"
                    label="Тип оси Х"
                    persistent-placeholder
                    dense
                    outlined
                    hide-details
                    :items="xAxisTypes"
                    value="value"
                  />
                </div>
                <div class="col-6">
                  <v-select
                    v-model="xAxis.barplotType"
                    label="Стиль столбцов"
                    persistent-placeholder
                    dense
                    outlined
                    hide-details
                    :items="xAxisBarplotType"
                    value="value"
                  />
                </div>
                <div class="col">
                  <v-text-field
                    v-model="xAxis.timeFormat"
                    :disabled="xAxis.type !== 'time'"
                    label="Формат времени"
                    persistent-placeholder
                    placeholder="Пример %Y-%m-%d %H:%M:%S"
                    dense
                    outlined
                    hide-details
                  />
                </div>
                <div class="col">
                  <div
                    class="v-label"
                    style="font-size: 12px;margin-top: -10px;margin-bottom: 2px;"
                  >
                    Градус наклона подписей
                  </div>
                  <v-btn-toggle
                    v-model="xAxis.textRotate"
                    color="blue"
                    dense
                  >
                    <v-btn :value="0">
                      0°
                    </v-btn>
                    <v-btn :value="45">
                      45°
                    </v-btn>
                    <v-btn :value="-45">
                      -45°
                    </v-btn>
                    <v-btn :value="90">
                      90°
                    </v-btn>
                    <v-btn :value="-90">
                      -90°
                    </v-btn>
                  </v-btn-toggle>
                </div>
              </div>
              <div class="row mt-4">
                <div class="col-8 py-0">
                  <v-checkbox
                    v-model="xAxis.barplotBarWidthEnabled"
                    :label="`Ширина столбцов барплот-графика: ${xAxis.barplotBarWidth}%`"
                    persistent-placeholder
                    dense
                    outlined
                    hide-details
                    color="blue"
                    class="mt-3"
                  />
                </div>
                <div class="col-4">
                  <v-slider
                    v-model="xAxis.barplotBarWidth"
                    :disabled="!xAxis.barplotBarWidthEnabled"
                    color="blue"
                    min="1"
                    max="100"
                    class="mt-0 mr-1"
                    hide-details
                    dense
                  />
                </div>
              </div>
              <div class="row mt-0">
                <div class="col-8 py-0">
                  <v-checkbox
                    v-model="xAxis.ticksEnabled"
                    :label="`Частота подписей оси X: ${xAxis.ticks}`"
                    persistent-placeholder
                    dense
                    outlined
                    hide-details
                    color="blue"
                    class="mt-3"
                  />
                </div>
                <div class="col-4">
                  <v-slider
                    v-model="xAxis.ticks"
                    :disabled="!xAxis.ticksEnabled"
                    color="blue"
                    min="1"
                    max="100"
                    class="mt-0 mr-1"
                    hide-details
                  />
                </div>
              </div>
              <!-- /forms -->
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
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
import draggable from 'vuedraggable';
import {
  mdiClose,
  mdiMenu,
  mdiChevronUp,
  mdiChevronDown,
  mdiChartBellCurve,
  mdiChartBar,
  mdiHelpCircleOutline,
} from '@mdi/js';

export default {
  name: 'DashChartSettings',
  components: {
    draggable,
  },
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    modalValue: { type: Boolean, default: false },
    // defaultOptions: { type: Object, default: () => ({}) },
    receivedSettings: {
      required: true,
      type: Object,
    },
    metricTypes: {
      type: Array,
      default: () => ([
        { value: 'line', text: 'Линейный' },
        { value: 'barplot', text: 'Столбчатый' },
      ]),
    },
    strokeWidthList: {
      type: Array,
      default: () => ([1, 1.5, 2, 2.5, 3, 4, 5]),
    },
    strokeDasharrayList: {
      type: Array,
      default: () => ([
        { value: '0', text: 'Сплошная' },
        { value: '5,5', text: 'Пунктирная' },
        { value: '1, 3', text: 'Точки' },
        { value: '1, 3, 6, 3', text: 'Точка-пунктир' },
      ]),
    },
    zerosAfterDotList: {
      type: Array,
      default: () => ([
        { value: 0, text: '0' },
        { value: 1, text: '0.0' },
        { value: 2, text: '0.00' },
        { value: 3, text: '0.000' },
        { value: 4, text: '0.0000' },
      ]),
    },
    yAxisSideList: {
      type: Array,
      default: () => ([
        { value: 'left', text: 'Левая' },
        { value: 'right', text: 'Правая' },
      ]),
    },
    xAxisTypes: {
      type: Array,
      default: () => ([
        { value: 'time', text: 'Временная шкала' },
        { value: 'linear', text: 'Линейные значения' },
      ]),
    },
    xAxisBarplotType: {
      type: Array,
      default: () => ([
        { text: 'Разделенный', value: 'divided' },
        { text: 'Наложенный', value: 'overlay' },
        { text: 'С накоплением', value: 'accumulation' },
      ]),
    },
  },
  data: () => ({
    mdiClose,
    mdiMenu,
    mdiChevronUp,
    mdiChevronDown,
    mdiChartBellCurve,
    mdiChartBar,
    mdiHelpCircleOutline,
    /** Local settings object based on receivedSettings props. */
    settings: {},
    isChanged: false,

    panelMetric: [],
    metricsByGroup: [],
    xAxis: {
      type: 'time',
      barplotType: 'divided',
      timeFormat: null,
      stringOX: null,
      barplotBarWidth: 80,
      barplotBarWidthEnabled: false,
      textRotate: -45, // 45, -45, 90, -90
      textTranslate: [-10, 0],
      textAnchor: 'end', // start, end
      ticksEnabled: false,
      ticks: 10,
    },
    colorPickerInputMode: false,
    openXAxisPanel: null,
    lastDotSearch: '',
    defaultLastDotItems: [
      { value: '0', text: 'Последнее' },
      { value: '1', text: 'Каждое' },
      { value: 'even', text: 'Четное' },
      { value: 'odd', text: 'Нечетное' },
      { value: '3', text: 'Каждое 3' },
      { value: '10', text: 'Указать число' },
    ],
  }),
  computed: {
    isOpen: {
      get() {
        return this.modalValue;
      },
      set(val) {
        this.panelMetric = [];
        this.$emit('updateModalValue', val);
      },
    },

    theme() {
      return this.$store.getters.getTheme;
    },

    isDarkTheme() {
      return this.$store.getters.getThemeTitle.indexOf('light') === -1;
    },

    metricsByGroupNoEmpty() {
      return this.metricsByGroup.filter((group) => group.length);
    },

    currentSettings() {
      return {
        metricsByGroup: [...this.metricsByGroupNoEmpty],
        xAxis: { ...this.xAxis },
      };
    },

    metricLineList() {
      const metrics = [];
      this.metricsByGroup.forEach((group, nG) => {
        group.forEach((metric) => {
          metrics.push({
            ...metric,
            group: nG,
          });
        });
      });
      return metrics;
    },
  },
  watch: {
    isOpen(val) {
      if (!val) {
        this.isChanged = false;
      }
    },

    metrics() {
      this.makeMetricsOrderList();
    },

    receivedSettings() {
      this.makeMetricsOrderList();
    },
  },
  mounted() {
    this.makeMetricsOrderList();
  },
  methods: {
    save() {
      this.panelMetric = [];
      this.$emit('save', { ...this.currentSettings });
      this.close(true);
    },

    update() {
      // this.$emit("save", { ...this.settings });
    },

    close() {
      this.panelMetric = [];
      this.makeMetricsOrderList();
      this.$emit('close');
    },

    changeMetricsOrder(nG, { added, removed }) {
      // remove yAxisLink on other metric outside group
      if (removed && removed.element?.yAxisLink) {
        removed.element.yAxisLink = null;
      }
      this.metricsByGroup = [...this.metricsByGroupNoEmpty];
      if (added && added.element) {
        Object.keys(this.metricsByGroup).forEach((nGroup) => {
          Object.keys(this.metricsByGroup[nGroup]).forEach((nMetric) => {
            const metric = this.metricsByGroup[nGroup][nMetric];
            if (added.element.name === metric.yAxisLink) {
              metric.yAxisLink = null;
            }
          });
        });
      }

      // add empty group
      if (this.metricsByGroup[this.metricsByGroup.length - 1].length !== 0) {
        this.metricsByGroup.push([]);
      }
    },

    makeMetricsOrderList() {
      this.xAxis = JSON.parse(JSON.stringify({
        ...this.xAxis,
        ...this.receivedSettings.xAxis,
      }));
      this.metricsByGroup = [...JSON.parse(JSON.stringify(this.receivedSettings.metricsByGroup))];
      this.metricsByGroup.push([]);
    },

    colorPickerInputChange() {
      this.colorPickerInputMode = !this.colorPickerInputMode;
    },
  },
};
</script>

<style lang="sass" scoped>
@import ../../sass/_colors
.dialog-content::v-deep,
.v-expansion-panel,
.v-color-picker
  background-color: $main_bg !important
.title-metric
  font-size: 16px
  font-weight: bold
  color: var(--primary_button)
  &-dot
    width: 12px
    height: 12px
    border-radius: 12px
    display: inline-block
    margin-right: 4px
    margin-bottom: -2px
  .v-icon
    color: var(--primary_button)
.dot-type
  background-color: var(--main_border)
  width: 10px
  height: 10px
  &-box
    border-radius: 0
  &-circle
    border-radius: 10px
.v-btn--active
  &:before
    background: none
  .dot-type
    background-color: var(--primary_button)

.metric-group-content
  margin-bottom: 20px
.draggable-item
  padding: 0
.panel-header
  min-height: 40px
.panel-content
  > div
    padding: 0 !important
.checkbox-toggle-data
  margin: 8px 8px 8px 20px
  > button
    height: 20px !important
    font-size: 10px
    &.v-item--active
      background: var(--main_border) !important
.sortable-chosen, .sortable-ghost
  opacity: .3
  background: var(--secondary_border) !important
</style>

<style lang="sass">
.groups-multiline-settings .v-expansion-panel-content__wrap
  padding: 0
.groups-multiline-settings .v-color-picker__controls
  padding: 6px 0
.theme--light.v-list-item .v-list-item__mask
  color: rgb(255 255 255)
  background: #7575756b
</style>
