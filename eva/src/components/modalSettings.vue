<template>
  <modal-persistent
    v-model="active"
    width="1140"
    :is-confirm="isChanged"
    :persistent="isChanged"
    :theme="theme"
    @cancelModal="checkOnCancel"
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
              @change="isChanged = true"
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
            <template v-if="checkOptions(field.optionGroup || field.option, field.relation)">
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
                    @change="isChanged = true"
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
                    @input="isChanged = true"
                    @change="(v) => {
                      if (field.onChange) {
                        options[field.option] = field.onChange(v)
                      }
                    }"
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
                    @change="isChanged = true"
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
                    @change="isChanged = true"
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
                      @input="isChanged = true"
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
                    @input="isChanged = true"
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
                    @input="isChanged = true"
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
                  @input="isChanged = true"
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
                :items="metricsName.map((el) => el.name)
                  .filter((name) =>
                    name === metrics[i - 1].name || !printedUnitedMetrics.includes(name)
                  )"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, fill: theme.$main_text }"
                hide-details
                outlined
                class="item-metric"
                label="Имя метрики"
                @click="changeColor"
                @change="isChanged = true"
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
                @change="isChanged = true"
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
                :disabled="!metrics[i - 1].manualBorder"
                outlined
                class="item-metric border"
                hide-details
                @input="isChanged = true"
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
                :disabled="!metrics[i - 1].manualBorder"
                outlined
                class="item-metric border"
                hide-details
                @input="isChanged = true"
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
                    min="0"
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
                    min="0"
                    max="100"
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
                v-model="metrics[i - 1].manualBorder"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text }"
                class="item-metric checkbox"
                label="Установить границы"
                hide-details
                @change="isChanged = true"
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
                @click="confirmDeleteMetric(i - 1)"
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
                @change="isChanged = true"
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
                @input="isChanged = true"
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
            v-if="checkOptions('fillColor') && accumulators.length > 0"
            ref="options"
            class="options-block"
          >
            <template
              v-for="(item, index) in metrics"
            >
              <div
                :key="`${index}title`"
                class="divider-tooltip-setting"
                :style="{ color: theme.$main_text }"
              >
                <p>Показатель {{ index + 1 }}</p>
                <div
                  :style="{ backgroundColor: theme.$main_text }"
                  class="divider-line"
                />
              </div>
              <div
                :key="`${index}options`"
                class="options-item-tooltip"
              >
                <v-select
                  v-model="accumulators[index].colorType"
                  :items="accumulatorColorTypes"
                  item-text="label"
                  item-value="value"
                  :color="theme.$primary_button"
                  :style="{
                    color: theme.$main_text,
                    fill: theme.$main_text,
                  }"
                  :menu-props="{
                    maxHeight: '150px',
                    overflow: 'auto',
                  }"
                  hide-details
                  outlined
                  class="item-metric"
                  label="Выберите тип"
                  @click="changeColor"
                  @input="isChanged = true"
                />
                <v-text-field
                  v-if="accumulators[index].colorType === 'color'"
                  v-model="accumulators[index].color"
                  placeholder="red #5F27FF rgb(95,39,255)"
                  label="Набор цветов"
                  :color="theme.$primary_button"
                  :style="{
                    color: theme.$main_text,
                    background: 'transparent',
                    borderColor: theme.$main_border,
                  }"
                  outlined
                  class="item-metric"
                  hide-details
                  @input="isChanged = true"
                >
                  <template #append>
                    <v-menu
                      top
                      transition="scale-transition"
                      :close-on-content-click="false"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-icon
                          size="16"
                          :style="{
                            color: theme.$main_text,
                            background: 'transparent',
                            borderColor: theme.$main_border,
                          }"
                          v-bind="attrs"
                          v-on="on"
                        >
                          {{ dropper }}
                        </v-icon>
                      </template>
                      <v-color-picker
                        v-model="accumulators[index].color"
                        dot-size="25"
                        hide-canvas
                        hide-inputs
                        hide-mode-switch
                        hide-sliders
                        mode="hexa"
                        show-swatches
                        swatches-max-height="200"
                        @input.capture="addColor($event)"
                      />
                    </v-menu>
                  </template>
                </v-text-field>
              </div>
            </template>
          </div>
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
                @input="isChanged = true"
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
                :menu-props="{
                  maxHeight: '150px',
                  overflow: 'auto',
                }"
                hide-details
                outlined
                class="item-metric"
                label="Выберите схему"
                @click="changeColor"
                @change="
                  () => {
                    colorsPie.nametheme =
                      colorsPie.theme === 'custom' ? '' : colorsPie.theme;
                    colorsPie.colors = themes[colorsPie.theme].join(' ');
                  }
                "
                @input="isChanged = true"
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
                @input="isChanged = true"
              />
              <v-text-field
                v-show="!defaultThemes.includes(colorsPie.theme)"
                v-model="colorsPie.colors"
                :disabled="!colorsPie.nametheme"
                placeholder="red #5F27FF rgb(95,39,255)"
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
                @input="isChanged = true"
              >
                <template #append>
                  <v-menu
                    top
                    transition="scale-transition"
                    :close-on-content-click="false"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-icon
                        size="16"
                        :style="{
                          color: theme.$main_text,
                          background: 'transparent',
                          borderColor: theme.$main_border,
                        }"
                        v-bind="attrs"
                        v-on="on"
                      >
                        {{ dropper }}
                      </v-icon>
                    </template>
                    <v-color-picker
                      v-model="colorPicker"
                      dot-size="25"
                      hide-canvas
                      hide-inputs
                      hide-mode-switch
                      hide-sliders
                      mode="hexa"
                      show-swatches
                      swatches-max-height="200"
                      @input.capture="addColor($event)"
                    />
                  </v-menu>
                </template>
              </v-text-field>
              <v-tooltip
                v-if="!defaultThemes.includes(colorsPie.theme)"
                bottom
                z-index="9000"
              >
                <template v-slot:activator="{ on }">
                  <v-icon
                    class="modal-settings__icon"
                    :style="{
                      color: theme.$main_text,
                      background: 'transparent',
                      borderColor: theme.$main_border,
                    }"
                    v-on="on"
                  >
                    ?
                  </v-icon>
                </template>
                <span>Эталон: red #5F27FF rgb(95,39,255)</span>
              </v-tooltip>
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
            <div
              class="divider-tooltip-setting"
              :style="{ color: theme.$main_text }"
            >
              <p>Тип визуализации</p>
              <div
                :style="{ backgroundColor: theme.$main_text }"
                class="divider-line"
              />
            </div>
            <div class="options-item-tooltip">
              <v-select
                v-model="pieType"
                :items="pieTypes"
                item-text="label"
                item-value="value"
                :color="theme.$primary_button"
                :style="{ color: theme.$main_text, fill: theme.$main_text }"
                :menu-props="{
                  maxHeight: '150px',
                  overflow: 'auto',
                }"
                hide-details
                outlined
                class="item-metric"
                label="Выберите тип"
                @click="changeColor"
                @input="isChanged = true"
              />
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
              @input="isChanged = true"
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
              @input="isChanged = true"
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
              @input="isChanged = true"
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
              @input="isChanged = true"
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
              @input="isChanged = true"
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
      <modal-confirm
        v-model="isConfirmModal"
        :theme="theme"
        :modal-text="`Вы точно хотите удалить вариант отображения ?`"
        btn-confirm-text="Удалить"
        btn-cancel-text="Отмена"
        @result="(confirm) => { confirm && deleteMetrics(deleteMetricId) }"
      />
    </div>
  </modal-persistent>
</template>

<script>
import { mdiMinusBox, mdiPlusBox, mdiEyedropper } from '@mdi/js';
import settings from '../js/componentsSettings';

export default {
  name: 'ModalSettings',
  model: {
    prop: 'modalValue',
    event: 'changeModalValue',
  },
  props: {
    modalValue: {
      type: Boolean,
      default: false,
    },
    idDashFrom: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      openNewScreen: false,
      primitivesLibraryAutoGrow: false,
      conclusion_count: {},
      replace_count: {},
      options: {},
      type_line: {},
      color: '',
      tooltipSettingShow: false,
      plus_icon: mdiPlusBox,
      minus_icon: mdiMinusBox,
      dropper: mdiEyedropper,
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
      pieType: '',
      pieTypes: [
        {
          value: 'pie',
          label: 'Круговая диограмма',
        },
        {
          value: 'donat',
          label: 'Кольцвая диограмма',
        },
      ],
      accumulators: [],
      accumulatorColorType: '',
      accumulatorColorTypes: [
        {
          value: 'color',
          label: 'Цвет',
        },
        {
          value: 'range',
          label: 'Диапазон',
        },
      ],
      themesArr: [],
      themes: {},
      metrics: [],
      metricsName: [],
      multilineYAxesBinding: { axesCount: 1, metrics: [], metricTypes: {} },
      multilineYAxesTypes: {},
      metricUnits: {},
      fieldsForRender: [],
      optionsByComponents: [],
      isChanged: false,
      isDelete: false,
      them: {},
      isConfirmModal: false,
      deleteMetricId: '',
      colorPicker: '',
      isOsmServerChange: false,
    };
  },
  computed: {
    printedUnitedMetrics() {
      return this.metrics.map((item) => item.name);
    },
    dashFromStore() {
      return this.$store.state[this.idDash];
    },
    // получаем объект с настройками моадлки натсроек
    getModalSettings() {
      if (!this.dashFromStore || !this.dashFromStore.modalSettings) {
        this.$store.commit('setState', [
          {
            object: this.dashFromStore,
            prop: 'modalSettings',
            value: {},
          },
        ]);
        this.$store.commit('setState', [
          {
            object: this.dashFromStore.modalSettings,
            prop: 'element',
            value: '',
          },
          {
            object: this.dashFromStore.modalSettings,
            prop: 'status',
            value: false,
          },
        ]);
      }
      return this.dashFromStore.modalSettings;
    },
    active: {
      get() {
        return this.dashFromStore.modalSettings.status;
      },
      set(value) {
        this.$store.commit('setModalSettings', {
          idDash: this.idDash,
          element: this.element,
          status: value,
        });
      },
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
      const [elem] = this.element.split('-');
      if (elem) {
        return this.optionsByComponents[elem] || [];
      }
      return [];
    },
    changeComponent() {
      return `${this.idDash}-${this.element}`;
    },
    element() {
      return this.getModalSettings.element;
    },
    // поля элемента данных
    titles() {
      return this.elementFromStore?.availableTableTitles;
    },
    elementFromStore() {
      return this.$store.state[this.idDash][this.element];
    },
    getSelectedTableTitles() {
      return this.elementFromStore?.selectedTableTitles;
    },
    getMetricsMulti() {
      if (!this.elementFromStore.metrics) {
        this.$store.commit('setState', [{
          object: this.elementFromStore,
          prop: 'metrics',
          value: [],
        }]);
      }
      return this.elementFromStore.metrics;
    },
  },
  watch: {
    options: {
      deep: true,
      handler(val, oldVal) {
        if (oldVal && Object?.keys(oldVal)?.length > 0) {
          this.isChanged = true;
        }
      },
    },
  },
  created() {
    this.tooltipSettingShow = this.element.indexOf('csvg') !== -1;
    this.metricsName = this.getMetricsMulti;
    this.loadComponentsSettings();
    this.prepareOptions();
  },
  methods: {
    confirmDeleteMetric(val) {
      this.isConfirmModal = true;
      this.deleteMetricId = val;
    },
    addColor(e) {
      if (this.element.indexOf('piechart') !== -1) {
        if (this.colorPicker) {
          if (this.colorsPie.colors === '') {
            this.colorsPie.colors += `${e}`;
          } else {
            this.colorsPie.colors += ` ${e}`;
          }
        }
        this.colorPicker = '';
      }
    },
    loadComponentsSettings() {
      const localOptions = {};
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
          localOptions[field.option] = { ...options };
        }
        return { ...field, items, each };
      });
      return localOptions;
    },
    handleChangeColor(e, i) {
      this.color = { ...this.color, [this.metrics[i].name]: e.target.value };
      this.isChanged = true;
    },
    handleChangeTypeLine(e, i) {
      this.type_line = { ...this.type_line, [this.metrics[i].name]: e };
      this.isChanged = true;
    },
    handleChangeConlusionCount(e, i) {
      if (e === null) {
        delete this.conclusion_count[this.metrics[i].name];
      } else {
        this.conclusion_count = {
          ...this.conclusion_count,
          [this.metrics[i].name]: Math.abs(Number(e)),
        };
      }
      this.isChanged = true;
    },
    handleChangeReplaceCount(e, i) {
      const val = Number(e);
      if (e === null || val < 0 || val > 100) {
        delete this.replace_count[this.metrics[i].name];
      } else {
        this.replace_count = {
          ...this.replace_count,
          [this.metrics[i].name]: val,
        };
      }
      this.isChanged = true;
    },
    // отправляем настройки в хранилище
    async setOptions() {
      // this.prepareUnitedSettingsBeforeSave();
      if (!this.options.level) {
        this.$set(this.options, 'level', 1);
      }
      if (this.options?.timeFormat === null) {
        this.$set(this.options, 'timeFormat', '%Y-%m-%d %H:%M:%S');
      }
      if (typeof this.options.size !== 'undefined') {
        if (this.options.size == null) {
          this.$set(this.options, 'size', '100px');
        } else if (String(this.options.size).indexOf('px') === -1) {
          this.$set(this.options, 'size', `${this.options.size}px`);
        }
      }
      if (this.element.indexOf('csvg') !== -1) {
        this.$set(this.options, 'tooltip', JSON.parse(JSON.stringify(this.tooltip)));
      }
      if (this.element.indexOf('piechart') !== -1) {
        this.options.metricsRelation = JSON.parse(
          JSON.stringify(this.metricsRelation),
        );
        if (this.colorsPie.nametheme) {
          this.$set(this.options, 'colorsPie', this.colorsPie);
          if (!this.defaultThemes.includes(this.colorsPie.nametheme)) {
            this.$set(
              this.themes,
              this.colorsPie.nametheme,
              this.colorsPie.colors.split(' '),
            );
            if (
              this.colorsPie.theme !== 'custom'
              && this.colorsPie.theme !== this.colorsPie.nametheme
            ) {
              delete this.themes[this.colorsPie.theme];
            }
            this.$set(this.colorsPie, 'theme', this.colorsPie.nametheme);
          }
          this.$set(this.options, 'themes', this.themes);
        }
        this.$set(this.options, 'pieType', this.pieType);
      }
      if (this.element.indexOf('accumulators') !== -1) {
        this.$set(this.options, 'fillColor', this.accumulators);
      }
      if (this.element.startsWith('multiLine')) {
        this.$store.commit('setMultilineMetricUnits', {
          idDash: this.idDash,
          elem: this.element,
          units: this.metricUnits,
        });
      }
      if (this.element.startsWith('map')) {
        this.changeSelectedLayer();
      }
      const options = {
        ...this.options,
        conclusion_count: this.conclusion_count,
        metrics: this.metrics,
        replace_count: this.replace_count,
        openNewScreen: this.openNewScreen,
        type_line: this.type_line,
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
    changeSelectedLayer() {
      // Берем активную подложку из сторы
      const selectedLayerFromStore = this.dashFromStore[this.element].options.selectedLayer;
      // let newSelectedLayer = null;
      if (!selectedLayerFromStore || selectedLayerFromStore?.name === 'Заданная в настройках') {
        this.$store.commit('setState', [
          {
            object: this.dashFromStore[this.element].options,
            prop: 'selectedLayer',
            value: this.options.osmserver
              ? {
                name: 'Заданная в настройках',
                tile: this.options.osmserver || [],
              }
              : null,
          },
        ]);
      }
    },
    cancelModal() {
      this.active = false;
      this.checkOnCancel();
    },
    // если нажали на отмену создания
    checkOnCancel() {
      if (this.isDelete) {
        this.themes = { ...this.themes, ...this.them };
        this.them = {};
        this.options.themes = this.themes;
        this.isDelete = false;
      }
    },
    checkEsc(event) {
      if (event.code === 'Escape') {
        this.checkOnCancel();
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
      this.isChanged = true;
      if (item === 'text') {
        this.tooltip.texts.push('');
      } else if (item === 'link') {
        this.tooltip.links.push({ name: '', url: '' });
      } else if (item === 'button') {
        this.tooltip.buttons.push({ name: '', id: '' });
      }
    },
    addMetrics() {
      this.isChanged = true;
      const arr = JSON.parse(JSON.stringify(this.metrics));
      arr.push({
        name: '',
        type: '',
        upborder: 0,
        lowborder: 0,
        manualBorder: false,
      });
      this.$set(this, 'metrics', arr);
    },
    deleteFromTooltip(item, i) {
      this.isChanged = true;
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
    prepareUnitedSettingsBeforeSave() {
      const metricNames = this.metrics.map((item) => item.name);

      // clear colors
      if (this.color) {
        Object.keys(this.color).forEach((name) => {
          if (!metricNames.includes(name)) {
            delete this.color[name];
          }
        });
      }

      // clear metricTypes
      if (this.multilineYAxesBinding.metricTypes) {
        Object.keys(this.multilineYAxesBinding.metricTypes).forEach((name) => {
          if (!metricNames.includes(name)) {
            delete this.multilineYAxesBinding.metricTypes[name];
          }
        });
      }
      if (this.type_line && typeof this.type_line === 'object') {
        Object.keys(this.type_line).forEach((name) => {
          if (!metricNames.includes(name)) {
            delete this.type_line[name];
          }
        });
      }
    },
    getSettingsByPath() {
      this.$store.commit('prepareSettingsStore', {
        path: this.idDash,
        element: this.element,
      });
      return this.$store.state[this.idDash][this.element]?.options || {};
    },
    changeColor() {
      if (document.querySelectorAll('.v-menu__content').length !== 0) {
        document.querySelectorAll('.v-menu__content').forEach((item) => {
          item.style.background = this.theme.$main_bg;
          item.style.color = this.theme.$main_text;
          item.style.border = `1px solid ${this.theme.$main_border}`;
        });
      }
    },
    //  понимает какие опции нужно вывести
    async prepareOptions() {
      await this.$store.dispatch('getSettingsByPath', {
        path: this.idDash,
        element: this.element,
      }).then((options) => {
        let localOptions = {};
        if (options) {
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

          if (this.element.startsWith('multiLine')) {
            if (options.yAxesBinding) {
              //     // поддержка старой структуры сохраненных настроек
              if (!options.metricTypes) {
                if (options.yAxesBinding.metrics) {
                  options.metricsAxis = options.yAxesBinding.metrics;
                }
                if (options.yAxesBinding.metricTypes) {
                  options.metricTypes = options.yAxesBinding.metricTypes;
                }
                if (options.yAxesBinding.axesCount) {
                  options.axesCount = options.yAxesBinding.axesCount;
                }
              }

              this.multilineYAxesBinding.axesCount = options.yAxesBinding.axesCount;
            } else {
              this.multilineYAxesBinding.axesCount = 1;
            }
            if (options.color) {
              this.color = options.color;
            }
            this.metricsName.forEach((metric) => {
              this.metricUnits[metric.name] = metric.units;
              //
              if (
                options.yAxesBinding
                && options.yAxesBinding.metrics
                && options.yAxesBinding.metricTypes
              ) {
                this.multilineYAxesBinding
                  .metrics[metric.name] = options.yAxesBinding.metrics[metric.name];
                this.multilineYAxesBinding
                  .metricTypes[metric.name] = options.yAxesBinding.metricTypes[metric.name];
              } else {
                this.multilineYAxesBinding.metrics[metric.name] = 'left';
                this.multilineYAxesBinding.metricTypes[metric.name] = 'linechart';
              }
            });
          }

          this.optionsItems.forEach((item) => {
            if (Object.keys(options).includes(item)) {
              if (item === 'tooltip') {
                this.tooltip = {};
                this.$set(this.tooltip, 'texts', JSON.parse(JSON.stringify([...[], ...options[item].texts])));
                this.$set(this.tooltip, 'links', JSON.parse(JSON.stringify([...[], ...options[item].links])));
                this.$set(this.tooltip, 'buttons', JSON.parse(JSON.stringify([
                  ...[],
                  ...options[item].buttons,
                ])));
              } else if (item === 'metrics') {
                this.metrics = JSON.parse(JSON.stringify(options[item]));
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
                  const oldVal = this.getSelectedTableTitles;
                  if (oldVal) {
                    val = oldVal;
                  }
                }
                localOptions[item] = val || [];
              } else if (item === 'pieType') {
                this.pieType = options[item];
              } else if (item === 'color') {
                localOptions[item] = options[item] || '';
              } else if (item === 'fillColor') {
                if (this.accumulators.length === 0) {
                  const defaultAccumulator = this.metrics.map(() => ({
                    colorType: 'color',
                    color: this.theme.$primary_button,
                  }));
                  this.$set(this, 'accumulators', defaultAccumulator);
                }
                if (options[item].length > 0) {
                  this.$set(this, 'accumulators', options[item]);
                }
              } else {
                localOptions[item] = options[item]
                !== null
                && typeof options[item]
                === 'object'
                  ? { ...options[item] }
                  : options[item];
              }
            } else {
              const propsToFalse = ['multiple', 'underline', 'onButton', 'pinned'];
              if (propsToFalse.includes(item)) {
                localOptions[item] = false;
              } else if (item === 'showlegend') {
                localOptions[item] = true;
              } else if (item === 'positionlegend') {
                localOptions[item] = 'right';
              } else if (item === 'titles') {
                let val = options[item];
                if (!val) {
                  // old settings
                  const oldVal = this.getSelectedTableTitles;
                  if (oldVal) {
                    val = oldVal;
                  }
                }
                // если не выбраны заголовки то выделить все имеющиеся
                if (val.length === 0) {
                  const allTitles = this.titles;
                  if (allTitles.length) {
                    val = [...allTitles];
                  }
                }
                localOptions[item] = val || [];
              } else {
                const field = settings.optionFields
                  .find((fieldItem) => fieldItem.option === item);
                if (field && field.default !== undefined) {
                  localOptions[item] = field.default;
                }
              }
            }
          });
        }
        if (!localOptions?.change) {
          localOptions.change = false;
        }

        localOptions = { ...this.loadComponentsSettings(), ...localOptions };
        this.$set(this, 'options', localOptions);
      });
    },
    onClickDeleteTheme(theme) {
      const nextTheme = this.defaultThemes[0];
      this.$set(this.colorsPie, 'theme', nextTheme);
      this.$set(this.colorsPie, 'nametheme', nextTheme);
      this.$set(this.colorsPie, 'colors', this.themes[nextTheme].join(' '));
      this.$set(this.options, 'colorsPie', this.colorsPie);
      this.$set(this.options, 'themes', this.themes);
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
.modal-settings__icon {
  font-style: normal;
  padding: 2px 8px;
  border: 1px solid;
  border-radius: 50%;
  font-size: 20px !important;
  cursor: pointer;
  margin-right: 20px;
}
</style>
