<template>
  <v-dialog
    v-model="active"
    width="1140"
    @keydown="checkEsc($event)"
    @click:outside="cancelModal"
  >
    <div class="settings-modal-block">
      <v-card :style="{ background: theme.$main_bg }">
        <v-card-text class="headline">
          <div
            class="settings-title"
            :style="{ color: theme.$title, borderColor: theme.$main_border }"
          >
            Настройки
            <p>{{ element }}</p>
          </div>
        </v-card-text>
        <div
          ref="options"
          class="options-block"
        >
          <div class="option-item">
            <v-switch
              v-model="openNewScreen"
              class="switch"
              :color="theme.$primary_button"
              :style="{ color: theme.$main_text }"
              label="Открыть в новой вкладке"
            />
          </div>
          <div class="option-item">
            <div
              class="name-option main item"
              :style="{
                color: theme.$title,
                borderBottom: `1px solid ${theme.$main_border}`,
              }"
            >
              Название
            </div>
            <div
              class="discribe-option main item"
              :style="{
                color: theme.$title,
                borderBottom: `1px solid ${theme.$main_border}`,
              }"
            >
              Описание
            </div>
            <div
              class="status-option main item"
              :style="{
                color: theme.$title,
                borderBottom: `1px solid ${theme.$main_border}`,
              }"
            >
              Статус
            </div>
          </div>
          <template v-for="field in fieldsForRender">
            <template
              v-if="
                checkOptions(field.optionGroup || field.option, field.relation)
              "
            >
              <div
                v-for="prop in field.each || [null]"
                :key="`${field.option}${prop}`"
                class="option-item"
              >
                <v-card-text
                  v-if="field.group"
                  class="headline"
                >
                  <div
                    class="settings-title"
                    :style="{
                      color: theme.$main_text,
                      borderColor: theme.$main_border,
                    }"
                  >
                    {{ field.group }}
                  </div>
                </v-card-text>
                <div
                  v-if="!field.group"
                  class="name-option item"
                  :style="{
                    color: theme.$main_text,
                    borderColor: theme.$main_border,
                  }"
                >
                  {{ field.optionGroup ? field.optionGroup + '.' : ''
                  }}{{ field.label || field.option }}
                  <span v-if="prop">.{{ prop }}</span>
                </div>
                <div
                  v-if="!field.group"
                  class="discribe-option item"
                  :style="{
                    color: theme.$main_text,
                    borderColor: theme.$main_border,
                  }"
                >
                  {{ field.description }}&nbsp;<span
                    :style="{ color: theme.$accent_ui_color }"
                    v-text="prop"
                  />
                </div>
                <div
                  v-if="!field.group"
                  class="status-option item"
                >
                  <!-- elem: switch -->
                  <v-switch
                    v-if="field.elem === 'switch'"
                    v-model="options[field.option]"
                    class="switch"
                    :color="theme.$primary_button"
                    :style="{ color: theme.$main_text }"
                    :label="String(options[field.option])"
                  />
                  <!-- elem: text-field -->
                  <v-text-field
                    v-else-if="field.elem === 'text-field'"
                    v-model="options[field.option]"
                    :placeholder="field.placeholder"
                    clearable
                    :color="theme.$primary_button"
                    :style="{
                      color: theme.$main_text,
                      background: 'transparent',
                      borderColor: theme.$main_border,
                    }"
                    outlined
                    class="subnumber"
                    hide-details
                    :type="field.elemType"
                    :min="field.elemMin"
                  />
                  <!-- elem: select -->
                  <v-select
                    v-else-if="field.elem === 'select' && !prop"
                    v-model="options[field.option]"
                    :items="field.items"
                    :placeholder="field.default"
                    :color="theme.$primary_button"
                    :style="{ color: theme.$main_text, fill: theme.$main_text }"
                    hide-details
                    outlined
                    class="subnumber"
                  />
                  <v-select
                    v-else-if="field.elem === 'select' && prop"
                    v-model="options[field.option][prop]"
                    :items="field.items"
                    :placeholder="field.default"
                    :color="theme.$primary_button"
                    :style="{ color: theme.$main_text, fill: theme.$main_text }"
                    hide-details
                    outlined
                    class="subnumber"
                  />
                  <!-- elem: checkbox-list -->
                  <div
                    v-else-if="field.elem === 'checkbox-list'"
                    class="checkbox-list"
                  >
                    <v-checkbox
                      v-for="setting in field.items"
                      :key="setting"
                      v-model="options[field.option]"
                      :value="setting"
                      :style="{ color: theme.$main_text }"
                      :label="setting"
                      hide-details
                      @change="
                        (val) => {
                          field.onChange ? field.onChange(val) : null;
                        }
                      "
                    />
                  </div>
                  <!-- elem: radio-group -->
                  <v-radio-group
                    v-else-if="field.elem === 'radio-group' && !prop"
                    v-model="options[field.option]"
                    :column="false"
                  >
                    <v-radio
                      v-for="{ label, value } in field.items"
                      :key="value"
                      :color="theme.$primary_button"
                      :style="{ color: theme.$main_text }"
                      :label="label || value"
                      :value="value"
                      class="mx-1"
                    />
                  </v-radio-group>
                  <v-radio-group
                    v-else-if="field.elem === 'radio-group' && prop"
                    v-model="options[field.option][prop]"
                    :column="false"
                  >
                    <v-radio
                      v-for="{ label, value } in field.items"
                      :key="value"
                      :color="theme.$primary_button"
                      :style="{ color: theme.$main_text }"
                      :label="label || value"
                      :value="value"
                      class="mx-1"
                    />
                  </v-radio-group>
                  <!-- end -->
                </div>
              </div>
            </template>
          </template>

          <template v-if="!options.united">
            <div
              v-for="metric in metricsName"
              :key="metric.name"
              class="option-item"
            >
              <div
                class="name-option item"
                :style="{
                  color: theme.$main_text,
                  borderColor: theme.$main_border,
                }"
              >
                {{ metric.name }} units
              </div>
              <div
                class="discribe-option item"
                :style="{
                  color: theme.$main_text,
                  borderColor: theme.$main_border,
                }"
              >
                Единицы измерения для линии {{ metric.name }}
              </div>
              <div class="status-option item">
                <v-text-field
                  v-model="metricUnits[metric.name]"
                  clearable
                  :color="theme.$primary_button"
                  :style="{
                    color: theme.$main_text,
                    background: 'transparent',
                    borderColor: theme.$main_border,
                  }"
                  outlined
                  class="subnumber"
                  hide-details
                />
              </div>
            </div>
          </template>

          <v-card-text
            v-if="!options.united && checkOptions('united')"
            class="headline"
          >
            <div
              class="settings-title"
              :style="{
                color: theme.$main_text,
                borderColor: theme.$main_border,
              }"
            >
              Настройки режима United
            </div>
          </v-card-text>
          <div
            v-if="!options.united && checkOptions('united')"
            class="options-block united-block"
          >
            <v-icon
              v-if="metrics.length === 0"
              class="icon-plus"
              :color="theme.$primary_button"
              @click="addMetrics"
            >
              {{ plus_icon }}
            </v-icon>
            <div
              v-for="i in metrics.length"
              :key="i"
              class="options-item-tooltip"
              style="flex-wrap: wrap; margin-bottom: 40px"
            >
              <v-select
                v-model="metrics[i - 1].name"
                :items="metricsName.map((el) => el.name)"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, fill: theme.$main_text }"
                hide-details
                outlined
                class="item-metric"
                label="Имя метрики"
                @click="changeColor"
              />
              <v-select
                v-model="metrics[i - 1].type"
                :items="['Line chart', 'Bar chart']"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, fill: theme.$main_text }"
                hide-details
                outlined
                class="item-metric"
                label="Тип графика"
                @click="changeColor"
              />
              <v-text-field
                v-model="metrics[i - 1].lowborder"
                clearable
                placeholder="0"
                label="Нижняя граница (ось Y)"
                :color="theme.$primary_button"
                :style="{
                  color: theme.$main_text,
                  background: 'transparent',
                  borderColor: theme.$main_border,
                }"
                :disabled="metrics[i - 1].manual"
                outlined
                class="item-metric border"
                hide-details
              />
              <v-text-field
                v-model="metrics[i - 1].upborder"
                clearable
                placeholder="0"
                label="Верхняя граница (ось Y)"
                :color="theme.$primary_button"
                :style="{
                  color: theme.$main_text,
                  background: 'transparent',
                  borderColor: theme.$main_border,
                }"
                :disabled="metrics[i - 1].manual"
                outlined
                class="item-metric border"
                hide-details
              />
              <br>
              <div class="item-metric">
                <div
                  class="discribe-option item"
                  :style="{
                    color: theme.$main_text,
                    borderColor: theme.$main_border,
                  }"
                >
                  Цвет
                </div>
                <div class="status-option item">
                  <label>
                    <input
                      :value="color[metrics[i - 1].name]"
                      style="width: 100px; cursor: pointer"
                      type="color"
                      name="multiline-color"
                      @change="(e) => handleChangeColor(e, i - 1)"
                    >
                  </label>
                </div>
              </div>
              <div>
                <div class="status-option item">
                  <v-text-field
                    :value="conclusion_count[metrics[i - 1].name]"
                    clearable
                    :color="theme.$primary_button"
                    :style="{
                      color: theme.$main_text,
                      background: 'transparent',
                      borderColor: theme.$main_border,
                    }"
                    style="min-width: 100px"
                    outlined
                    class="item-metric"
                    label="Вывод значений"
                    type="number"
                    hide-details
                    @input="(e) => handleChangeConlusionCount(e, i - 1)"
                  />
                </div>
              </div>
              <div>
                <div class="status-option item">
                  <v-text-field
                    :value="replace_count[metrics[i - 1].name]"
                    clearable
                    :color="theme.$primary_button"
                    :style="{
                      color: theme.$main_text,
                      background: 'transparent',
                      borderColor: theme.$main_border,
                    }"
                    style="min-width: 100px"
                    outlined
                    class="item-metric"
                    label="Значения после запятой"
                    type="number"
                    hide-details
                    @input="(e) => handleChangeReplaceCount(e, i - 1)"
                  />
                </div>
              </div>
              <div>
                <div class="status-option item">
                  <v-select
                    :value="type_line[metrics[i - 1].name]"
                    :disabled="metrics[i - 1].type === 'Bar chart'"
                    label="Тип линии"
                    class="item-metric"
                    :items="[
                      {
                        text: '━━━━━━',
                        value: 'solid',
                      },
                      {
                        text: '-------------------',
                        value: 'dashed',
                      },
                      {
                        text: '.........................',
                        value: 'dotted',
                      },
                      {
                        text: '﹎﹎﹎﹎﹎﹎',
                        value: 'double',
                      },
                    ]"
                    :color="theme.$primary_button"
                    :style="{ color: theme.$main_text, fill: theme.$main_text }"
                    hide-details
                    outlined
                    @change="(e) => handleChangeTypeLine(e, i - 1)"
                  />
                </div>
              </div>
              <v-checkbox
                v-model="metrics[i - 1].manual"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text }"
                class="item-metric checkbox"
                label="Автоматически/Вручную"
                hide-details
              />
              <v-icon
                class="icon-inside"
                :color="theme.$primary_button"
                @click="addMetrics"
              >
                {{ plus_icon }}
              </v-icon>
              <v-icon
                class="icon-inside"
                :color="theme.$primary_button"
                @click="deleteMetrics(i - 1)"
              >
                {{ minus_icon }}
              </v-icon>
            </div>
          </div>

          <div
            v-if="checkOptions('positionlegend')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{
                color: theme.$main_text,
                borderColor: theme.$main_border,
              }"
            >
              positionlegend
            </div>
            <div
              class="discribe-option item"
              :style="{
                color: theme.$main_text,
                borderColor: theme.$main_border,
              }"
            >
              Позиция легенды
            </div>
            <div class="status-option item">
              <v-select
                v-model="options.positionlegend"
                :items="['top', 'left', 'right', 'bottom']"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, fill: theme.$main_text }"
                hide-details
                outlined
                class="subnumber"
                label="Позиция легенды"
                @click="changeColor"
              />
            </div>
          </div>

          <div
            v-if="checkOptions('primitivesLibrary')"
            class="option-item"
          >
            <v-container fluid>
              <v-card-text class="headline">
                <div
                  class="settings-title"
                  :style="{
                    color: theme.$main_text,
                    borderColor: theme.$main_border,
                  }"
                >
                  Библиотека примитивов отображения
                </div>
              </v-card-text>
              <v-btn
                plain
                link
                small
                class="mb-3 text-lowercase"
                :color="theme.$main_text"
                @click="primitivesLibraryAutoGrow = !primitivesLibraryAutoGrow"
              >
                {{ primitivesLibraryAutoGrowLinkText }}
              </v-btn>
              <v-textarea
                v-model="options.primitivesLibrary"
                name="input-7-1"
                filled
                rows="6"
                label="JSON c примитивами"
                :auto-grow="primitivesLibraryAutoGrow"
                class="textarea-event"
                spellcheck="false"
                :color="theme.$main_text"
                :style="{ color: theme.$main_text }"
                outlined
                hide-details
              />
              <v-btn
                v-if="primitivesLibraryAutoGrow"
                plain
                link
                small
                class="text-lowercase"
                :color="theme.$main_text"
                @click="primitivesLibraryAutoGrow = !primitivesLibraryAutoGrow"
              >
                {{ primitivesLibraryAutoGrowLinkText }}
              </v-btn>
            </v-container>
          </div>
          <v-card-text
            v-if="checkOptions('piechartSettings')"
            class="headline"
          >
            <div
              class="settings-title"
              :style="{
                color: theme.$main_text,
                borderColor: theme.$main_border,
              }"
            >
              Настройки круговой диаграммы
            </div>
          </v-card-text>
          <div
            v-if="checkOptions('piechartSettings')"
            ref="options"
            class="options-block"
          >
            <div
              class="divider-tooltip-setting"
              :style="{ color: theme.$main_text }"
            >
              <p>Соотношение метрик</p>
              <div
                :style="{ backgroundColor: theme.$main_text }"
                class="divider-line"
              />
            </div>
            <div class="options-item-tooltip">
              <v-select
                v-for="(_, i) in metricsRelation.namesMetric"
                :key="i + 'metric'"
                v-model="metricsRelation.relations[i]"
                :items="metricsRelation.metrics"
                :label="metricsRelation.namesMetric[i]"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, fill: theme.$main_text }"
                hide-details
                outlined
                class="item-metric"
                @click="changeColor"
              />
            </div>
            <div
              class="divider-tooltip-setting"
              :style="{ color: theme.$main_text }"
            >
              <p>Цветовая схема</p>
              <div
                :style="{ backgroundColor: theme.$main_text }"
                class="divider-line"
              />
            </div>
            <div class="options-item-tooltip">
              <v-select
                v-model="colorsPie.theme"
                :items="Object.keys(themes)"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, fill: theme.$main_text }"
                hide-details
                outlined
                class="item-metric"
                label="Выберите схему"
                @click="changeColor"
                @change="
                  () => {
                    colorsPie.nametheme =
                      colorsPie.theme === 'custom' ? '' : colorsPie.theme;
                    colorsPie.colors = themes[colorsPie.theme].join(',');
                  }
                "
              />
              <v-text-field
                v-show="!defaultThemes.includes(colorsPie.theme)"
                v-model="colorsPie.nametheme"
                placeholder="green"
                label="Имя схемы"
                :color="theme.$primary_button"
                :style="{
                  color: theme.$main_text,
                  background: 'transparent',
                  borderColor: theme.$main_border,
                }"
                outlined
                class="item-metric"
                hide-details
              />
              <v-text-field
                v-show="!defaultThemes.includes(colorsPie.theme)"
                v-model="colorsPie.colors"
                :disabled="!colorsPie.nametheme"
                placeholder="red,#5F27FF,rgb(95, 39, 255)"
                label="Набор цветов"
                :color="theme.$primary_button"
                :style="{
                  color: theme.$main_text,
                  background: 'transparent',
                  borderColor: theme.$main_border,
                }"
                outlined
                class="item-metric"
                :class="{ disabled: !colorsPie.nametheme }"
                hide-details
              />
              <v-btn
                v-if="
                  !defaultThemes.includes(colorsPie.theme) &&
                    colorsPie.theme !== 'custom'
                "
                :style="`background: ${theme.$secondary_bg}; color: ${theme.$main_text}`"
                :color="theme.$primary_button"
                @click="onClickDeleteTheme(colorsPie.theme)"
              >
                Удалить
              </v-btn>
            </div>
          </div>
        </div>
        <v-card-text
          v-if="tooltipSettingShow"
          class="headline"
        >
          <div
            class="settings-title"
            :style="{
              color: theme.$main_text,
              borderColor: theme.$main_border,
            }"
          >
            Настройки tooltip
          </div>
        </v-card-text>
        <div
          v-if="tooltipSettingShow"
          ref="options"
          class="options-block"
        >
          <div
            class="divider-tooltip-setting"
            :style="{ color: theme.$main_text }"
          >
            <p>Текст</p>
            <div
              :style="{ backgroundColor: theme.$main_text }"
              class="divider-line"
            />
          </div>
          <v-icon
            v-if="tooltip.texts.length === 0"
            class="icon-plus"
            :color="theme.$primary_button"
            @click="addIntoTooltip('text')"
          >
            {{ plus_icon }}
          </v-icon>
          <div
            v-for="i in tooltip.texts.length"
            :key="i + 'text'"
            class="options-item-tooltip"
          >
            <v-text-field
              v-model="tooltip.texts[i - 1]"
              clearable
              placeholder="Введите текст tooltip"
              :color="theme.$primary_button"
              :style="{
                color: theme.$main_text,
                background: 'transparent',
                borderColor: theme.$main_border,
              }"
              outlined
              class="item-text"
              hide-details
            />
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="addIntoTooltip('text')"
            >
              {{ plus_icon }}
            </v-icon>
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="deleteFromTooltip('text', i - 1)"
            >
              {{ minus_icon }}
            </v-icon>
          </div>
          <div
            class="divider-tooltip-setting"
            :style="{ color: theme.$main_text }"
          >
            <p>Ссылка</p>
            <div
              :style="{ backgroundColor: theme.$main_text }"
              class="divider-line"
            />
          </div>
          <v-icon
            v-if="tooltip.links.length === 0"
            class="icon-plus"
            :color="theme.$primary_button"
            @click="addIntoTooltip('link')"
          >
            {{ plus_icon }}
          </v-icon>
          <div
            v-for="i in tooltip.links.length"
            :key="i + 'links'"
            class="options-item-tooltip"
          >
            <v-text-field
              v-model="tooltip.links[i - 1].name"
              clearable
              placeholder="Введите название ссылки"
              :color="theme.$primary_button"
              :style="{
                color: theme.$main_text,
                background: 'transparent',
                borderColor: theme.$main_border,
              }"
              outlined
              class="item-link"
              hide-details
            />
            <v-text-field
              v-model="tooltip.links[i - 1].url"
              clearable
              placeholder="Введите текст ссылки"
              :color="theme.$primary_button"
              :style="{
                color: theme.$main_text,
                background: 'transparent',
                borderColor: theme.$main_border,
              }"
              outlined
              class="item-link"
              hide-details
            />
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="addIntoTooltip('link')"
            >
              {{ plus_icon }}
            </v-icon>
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="deleteFromTooltip('link', i - 1)"
            >
              {{ minus_icon }}
            </v-icon>
          </div>
          <div
            class="divider-tooltip-setting"
            :style="{ color: theme.$main_text }"
          >
            <p>Кнопка</p>
            <div
              :style="{ backgroundColor: theme.$main_text }"
              class="divider-line"
            />
          </div>
          <v-icon
            v-if="tooltip.buttons.length === 0"
            class="icon-plus"
            :color="theme.$primary_button"
            @click="addIntoTooltip('button')"
          >
            {{ plus_icon }}
          </v-icon>
          <div
            v-for="i in tooltip.buttons.length"
            :key="i + 'button'"
            class="options-item-tooltip"
          >
            <v-text-field
              v-model="tooltip.buttons[i - 1].name"
              clearable
              placeholder="Введите название кнопки"
              :color="theme.$primary_button"
              :style="{
                color: theme.$main_text,
                background: 'transparent',
                borderColor: theme.$main_border,
              }"
              outlined
              class="item-button"
              hide-details
            />
            <v-text-field
              v-model="tooltip.buttons[i - 1].id"
              clearable
              placeholder="Введите id кнопки"
              :color="theme.$primary_button"
              :style="{
                color: theme.$main_text,
                background: 'transparent',
                borderColor: theme.$main_border,
              }"
              outlined
              class="item-button"
              hide-details
            />
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="addIntoTooltip('button')"
            >
              {{ plus_icon }}
            </v-icon>
            <v-icon
              class="icon-inside"
              :color="theme.$primary_button"
              @click="deleteFromTooltip('button', i - 1)"
            >
              {{ minus_icon }}
            </v-icon>
          </div>
        </div>

        <v-card-actions class="actions-settings">
          <v-spacer />
          <v-btn
            small
            :color="theme.$primary_button"
            class="create-btn"
            @click="setOptions"
          >
            Подтвердить
          </v-btn>
          <v-btn
            small
            :color="theme.$primary_button"
            class="create-btn"
            @click="cancelModal"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import { mdiMinusBox, mdiPlusBox } from '@mdi/js';
import settings from '../js/componentsSettings.js';

export default {
  props: {
    idDashFrom: null,
  },
  data() {
    return {
      element: '',
      openNewScreen: false,
      primitivesLibraryAutoGrow: false,
      conclusion_count: {},
      replace_count: {},
      options: {},
      type_line: 'solid',
      color: {},
      tooltipSettingShow: false,
      plus_icon: mdiPlusBox,
      minus_icon: mdiMinusBox,
      tooltip: {
        texts: [],
        links: [],
        buttons: [],
      },
      metricsRelation: {
        metrics: [],
        relations: [],
        namesMetric: ['Категория', 'Процентное соотношение'],
      },
      colorsPie: {
        theme: 'neitral',
        colors: '',
        nametheme: '',
      },
      defaultThemes: ['neitral', 'indicted'],
      themesArr: [],
      themes: {},
      metrics: [],
      metricsName: [],
      multilineYAxesBinding: { axesCount: 1, metrics: {}, metricTypes: {} },
      multilineYAxesTypes: {},
      metricUnits: {},
      fieldsForRender: [],
      optionsByComponents: [],
      isDelete: false,
      them: {},
    };
  },
  computed: {
    active() {
      return this.$store.getters.getModalSettings(this.idDash).status;
    },
    idDash() {
      return this.idDashFrom;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    primitivesLibraryAutoGrowLinkText() {
      return this.primitivesLibraryAutoGrow
        ? 'Свернуть поле'
        : 'Расширить поле';
    },
    optionsItems() {
      if (!this.element) {
        return [];
      }
      const elem = this.element.split('-')[0];
      return elem ? this.optionsByComponents[elem] || [] : [];
    },
    changeComponent() {
      return `${this.idDash}-${this.element}`;
    },

    // поля элемента данных
    titles() {
      return this.$store.getters.getAvailableTableTitles(
        this.idDash,
        this.element,
      );
    },
  },
  watch: {
    changeComponent() {
      this.options = {};
      this.loadComponentsSettings();
      this.prepareOptions();
    },
    titles() {
      this.loadComponentsSettings();
      this.prepareOptions();
    },
    async active(val) {
      if (val) {
        // если окно должно быть открыто
        const settings = this.$store.getters.getModalSettings(this.idDash);
        this.element = settings.element; // получаем для каокго элемнета вывести настройки
        this.tooltipSettingShow = this.element.indexOf('csvg') !== -1;
        this.metricsName = this.$store.getters.getMetricsMulti({
          idDash: this.idDash,
          id: this.element,
        });
        if (this.element.startsWith('multiLine')) {
          const opt = await this.$store.dispatch('getSettingsByPath', {
            path: this.idDash,
            element: this.element,
          });
          if (opt.conclusion_count) {
            this.conclusion_count = opt.conclusion_count;
          }

          if (opt.yAxesBinding) {
            // поддержка старой структуры сохраненных настроек
            if (!opt.metricTypes) {
              if (opt.yAxesBinding.metrics) {
                opt.metricsAxis = opt.yAxesBinding.metrics;
              }
              if (opt.yAxesBinding.metricTypes) {
                opt.metricTypes = opt.yAxesBinding.metricTypes;
              }
              if (opt.yAxesBinding.axesCount) {
                opt.axesCount = opt.yAxesBinding.axesCount;
              }
            }

            this.multilineYAxesBinding.axesCount = opt.yAxesBinding.axesCount;
          } else {
            this.multilineYAxesBinding.axesCount = 1;
          }

          if (opt.type_line) {
            this.type_line = opt.type_line;
          }

          if (opt.color) {
            this.color = opt.color;
          }

          this.metricsName.forEach((metric) => {
            this.metricUnits[metric.name] = metric.units;

            if (
              opt.yAxesBinding
              && opt.yAxesBinding.metrics
              && opt.yAxesBinding.metricTypes
            ) {
              this.multilineYAxesBinding.metrics[metric.name] = opt.yAxesBinding.metrics[metric.name];
              this.multilineYAxesBinding.metricTypes[metric.name] = opt.yAxesBinding.metricTypes[metric.name];
            } else {
              this.multilineYAxesBinding.metrics[metric.name] = 'left';
              this.multilineYAxesBinding.metricTypes[metric.name] = 'linechart';
            }
          });
        }
        await this.prepareOptions();
      }
    },
    element() {
      this.loadComponentsSettings();
    },
  },
  created() {
    this.cancelModal();
  },
  mounted() {
    const settings = this.$store.getters.getModalSettings(this.idDash);
    this.element = settings.element;
    this.loadComponentsSettings();
    this.prepareOptions();
  },
  methods: {
    loadComponentsSettings() {
      this.optionsByComponents = settings.options;
      this.fieldsForRender = settings.optionFields.map((field) => {
        const items = typeof field.items === 'function'
          ? field.items.call(this)
          : field.items;
        const each = typeof field.each === 'function' ? field.each.call(this) : field.each;
        if (each) {
          const options = {};
          each.forEach((key) => {
            options[key] = field.items[0]?.value;
          });
          this.$set(this.options, field.option, { ...options });
        }
        return { ...field, items, each };
      });
    },
    handleChangeColor(e, i) {
      this.color = { ...this.color, [this.metrics[i].name]: e.target.value };
    },
    handleChangeTypeLine(e, i) {
      this.type_line = { ...this.type_line, [this.metrics[i].name]: e };
    },

    handleChangeConlusionCount(e, i) {
      this.conclusion_count = {
        ...this.conclusion_count,
        [this.metrics[i].name]: Number(e),
      };
    },

    handleChangeReplaceCount(e, i) {
      this.replace_count = {
        ...this.replace_count,
        [this.metrics[i].name]: Number(e),
      };
    },
    // отправляем настройки в хранилище
    async setOptions() {
      if (!this.options.level) {
        this.options.level = 1;
      }

      if (
        typeof this.options.timeFormat !== 'undefined'
        && this.options.timeFormat == null
      ) {
        this.options.timeFormat = '%Y-%m-%d %H:%M:%S';
      }
      if (typeof this.options.size !== 'undefined') {
        if (this.options.size == null) {
          this.options.size = '100px';
        } else if (String(this.options.size).indexOf('px') === -1) {
          this.options.size = `${this.options.size}px`;
        }
      }
      // let options = {...{},...this.options};
      if (this.element.indexOf('csvg') !== -1) {
        this.options.tooltip = this.tooltip;
      }
      if (this.element.indexOf('piechart') !== -1) {
        this.options.metricsRelation = JSON.parse(
          JSON.stringify(this.metricsRelation),
        );
        if (this.colorsPie.nametheme) {
          this.options.colorsPie = this.colorsPie;
          if (!this.defaultThemes.includes(this.colorsPie.nametheme)) {
            this.themes[this.colorsPie.nametheme] = this.colorsPie.colors.split(',');
            if (
              this.colorsPie.theme !== 'custom'
              && this.colorsPie.theme !== this.colorsPie.nametheme
            ) {
              delete this.themes[this.colorsPie.theme];
            }
            this.colorsPie.theme = this.colorsPie.nametheme;
          }
          this.options.themes = this.themes;
        }
      }
      if (this.element.startsWith('multiLine')) {
        this.$store.commit('setMultilineMetricUnits', {
          idDash: this.idDash,
          elem: this.element,
          units: this.metricUnits,
        });
      }

      const options = {
        ...this.options,
        conclusion_count: this.conclusion_count,
        replace_count: this.replace_count,
        openNewScreen: this.openNewScreen,
        type_line: this.type_line,
        color: this.color,
        updated: Date.now(),
      };
      await this.$store.dispatch('saveSettingsToPath', {
        path: this.idDash,
        element: this.element,
        options,
      });
      if (this.isDelete) {
        this.deleteTheme();
      }
      this.cancelModal();
    },
    // если нажали на отмену создания
    cancelModal() {
      this.$store.dispatch('closeModalSettings', { path: this.idDash });
      if (this.isDelete) {
        this.themes = { ...this.themes, ...this.them };
        this.them = {};
        this.options.themes = this.themes;
        this.isDelete = false;
        this.setOptions();
      }
    },
    checkEsc(event) {
      if (event.code === 'Escape') {
        this.cancelModal();
      }
    },
    checkOptions(option, relation) {
      // проверяет есть ли такая опция уже в массиве с опциями
      if (relation !== undefined) {
        if (relation.forEach) {
          const res = relation.filter((item) => {
            if (typeof item === 'object') {
              let show = true;
              Object.keys(item).forEach((key) => {
                if (show && this.options[key] !== item[key]) {
                  show = false;
                }
              });
              return show;
            }
            return !!this.options[item];
          });
          if (res.length !== relation.length) {
            return false;
          }
        } else if (!this.options[relation]) {
          return false;
        }
      }
      return this.optionsItems.includes(option);
    },
    addIntoTooltip(item) {
      if (item === 'text') {
        this.tooltip.texts.push('');
      } else if (item === 'link') {
        this.tooltip.links.push({ name: '', url: '' });
      } else if (item === 'button') {
        this.tooltip.buttons.push({ name: '', id: '' });
      }
    },
    addMetrics() {
      this.metrics.push({
        name: '',
        type: '',
        upborder: 0,
        lowborder: 0,
        manual: true,
      });
    },
    deleteFromTooltip(item, i) {
      if (item === 'text') {
        this.tooltip.texts.splice(i, 1);
      } else if (item === 'link') {
        this.tooltip.links.splice(i, 1);
      } else if (item === 'button') {
        this.tooltip.buttons.splice(i, 1);
      }
    },
    deleteMetrics(i) {
      this.metrics.splice(i, 1);
    },
    changeColor() {
      if (document.querySelectorAll('.v-menu__content').length !== 0) {
        document.querySelectorAll('.v-menu__content').forEach((item) => {
          item.style.boxShadow = `0 5px 5px -3px ${this.theme.$main_border},0 8px 10px 1px ${this.theme.$main_border},0 3px 14px 2px ${this.theme.$main_border}`;
          item.style.background = this.theme.$main_bg;
          item.style.color = this.theme.$main_text;
          item.style.border = `1px solid ${this.theme.$main_border}`;
        });
      }
    },
    //  понимает какие опции нужно вывести
    async prepareOptions() {
      const options = await this.$store.dispatch('getSettingsByPath', {
        path: this.idDash,
        element: this.element,
      });

      if (options.color) {
        this.color = options.color;
      }

      if (options.type_line) {
        this.type_line = options.type_line;
      }

      if (options.conclusion_count) {
        this.conclusion_count = options.conclusion_count;
      }

      if (options.replace_count) {
        this.replace_count = options.replace_count;
      }

      this.optionsItems.forEach((item) => {
        if (Object.keys(options).includes(item)) {
          if (item === 'tooltip') {
            this.tooltip = {};
            this.$set(this.tooltip, 'texts', [...[], ...options[item].texts]);
            this.$set(this.tooltip, 'links', [...[], ...options[item].links]);
            this.$set(this.tooltip, 'buttons', [
              ...[],
              ...options[item].buttons,
            ]);
          } else if (item === 'metrics') {
            // this.$set(this,'metrics',options[item]);
            this.metrics = options[item];
          } else if (item === 'metricsRelation') {
            this.metricsRelation = {};
            this.$set(this.metricsRelation, 'metrics', [
              ...[],
              ...options[item].metrics,
            ]);
            this.$set(this.metricsRelation, 'relations', [
              ...[],
              ...options[item].relations,
            ]);
            this.$set(this.metricsRelation, 'namesMetric', [
              'Категория',
              'Процентное соотношение',
            ]);
          } else if (item === 'colorsPie') {
            this.colorsPie = {};
            this.$set(this.colorsPie, 'theme', options[item].theme);
            this.$set(this.colorsPie, 'colors', options[item].colors);
            this.$set(this.colorsPie, 'nametheme', options[item].nametheme);
          } else if (item === 'themes') {
            this.themesArr = Object.keys(options[item]);
            this.themes = options[item];
          } else if (item === 'titles') {
            let val = options[item];
            if (!val) {
              // old settings
              const oldVal = this.$store.getters.getSelectedTableTitles(
                this.idDash,
                this.element,
              );
              if (oldVal) {
                val = oldVal;
              }
            }
            // если не выбраны заголовки то выделить все имеющиеся
            if (val.length === 0) {
              const allTitles = this.$store.getters.getAvailableTableTitles(
                this.idDash,
                this.element,
              );
              if (allTitles.length) {
                val = [...allTitles];
              }
            }
            this.$set(this.options, item, val || []);
          } else {
            const val = options[item] !== null && typeof options[item] === 'object'
              ? { ...options[item] }
              : options[item];
            this.$set(this.options, item, val);
          }
        } else {
          const propsToFalse = ['multiple', 'underline', 'onButton', 'pinned'];
          if (propsToFalse.includes(item)) {
            this.$set(this.options, item, false);
          } else if (item === 'showlegend') {
            this.$set(this.options, item, true);
          } else if (item === 'positionlegend') {
            this.$set(this.options, item, 'right');
          } else {
            const field = settings.optionFields.find(
              (field) => field.option === item,
            );
            if (field && field.default !== undefined) {
              this.$set(this.options, item, field.default);
            }
          }
        }
      });
      if (!this.options.change) {
        this.$set(this.options, 'change', false);
      }
    },
    onClickDeleteTheme(theme) {
      const nextTheme = this.defaultThemes[0];
      this.colorsPie.theme = nextTheme;
      this.colorsPie.nametheme = nextTheme;
      this.colorsPie.colors = this.themes[nextTheme].join(',');
      this.them = { ...this.them, [theme]: this.themes?.[theme] };
      delete this.themes[theme];
      this.isDelete = true;
    },
    deleteTheme() {
      this.options.colorsPie = this.colorsPie;
      this.options.themes = this.themes;
      this.isDelete = false;
      this.them = {};
    },
  },
};
</script>

<style lang="scss">
@import '../sass/modalSettings.sass';
</style>
