<template>
  <v-dialog
    v-model="active"
    width="1140"
    @keydown="checkEsc($event)"
    @click:outside="cancelModal"
  >
    <div class="settings-modal-block">
      <v-card :style="{background:theme.$main_bg}">
        <v-card-text class="headline">
          <div
            class="settings-title"
            :style="{color:theme.$title,borderColor:theme.$main_border}"
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
              :style="{color:theme.$main_text}"
              label="Открыть в новой вкладке"
            />
          </div>
          <div class="option-item">
            <div
              class="name-option main item"
              :style="{color:theme.$title, borderBottom: `1px solid ${theme.$main_border}`}"
            >
              Название
            </div>
            <div
              class="discribe-option main item"
              :style="{color:theme.$title, borderBottom: `1px solid ${theme.$main_border}`}"
            >
              Описание
            </div>
            <div
              class="status-option main item"
              :style="{color:theme.$title, borderBottom: `1px solid ${theme.$main_border}`}"
            >
              Статус
            </div>
          </div>
          <div
            v-for="field in fieldsForRender"
            :key="field.option"
            v-if="checkOptions(field.optionGroup || field.option, field.relation)"
            class="option-item"
          >
            <v-card-text
              v-if="field.group"
              class="headline"
            >
              <div
                class="settings-title"
                :style="{color:theme.$main_text,borderColor:theme.$main_border}"
              >
                {{ field.group }}
              </div>
            </v-card-text>
            <div
              v-if="!field.group"
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              {{ field.optionGroup ? field.optionGroup+'.' : '' }}{{ field.label || field.option }}
            </div>
            <div
              v-if="!field.group"
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              {{ field.description }}
            </div>
            <div
              v-if="!field.group"
              class="status-option item">
              <!-- elem: switch -->
              <v-switch
                v-if="field.elem === 'switch'"
                v-model="options[field.option]"
                class="switch"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
                :label="String(options[field.option])"
              />
              <!-- elem: text-field -->
              <v-text-field
                  v-else-if="field.elem === 'text-field'"
                  v-model="options[field.option]"
                  :placeholder="field.placeholder"
                  clearable
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                  outlined
                  class="subnumber"
                  hide-details
                  @change="val => { field.onChange ? field.onChange(val) : null}"
                  :type="field.elemType"
                  :min="field.elemMin"
              />
              <!-- elem: select -->
              <v-select
                  v-else-if="field.elem === 'select'"
                  v-model="options[field.option]"
                  :items="typeof field.items === 'function' ? field.items() : field.items"
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text, fill: theme.$main_text}"
                  hide-details
                  outlined
                  class="subnumber"
              />
              <!-- elem: checkbox-list -->
              <div
                  v-else-if="field.elem === 'checkbox-list'"
                  class="checkbox-list">
                <v-checkbox
                    v-for="(setting) in field.items()"
                    :key="setting"
                    :input-value="field.items()"
                    :style="{color:theme.$main_text}"
                    :label="setting"
                    :value="setting"
                    @change="val => { field.onChange ? field.onChange(val) : null}">
                </v-checkbox>
              </div>
              <!-- elem: radio-group -->
              <v-radio-group
                  v-else-if="field.elem === 'radio-group'"
                  v-model="options[field.option]"
                  :column="false"
              >
                <v-radio
                    v-for="{label, value} in field.items"
                    :color="theme.$primary_button"
                    :style="{color:theme.$main_text}"
                    :label="label || value"
                    :value="value"
                    class="mx-1"
                />
              </v-radio-group>
              <!-- end -->
            </div>
          </div>

          <!-- @todo: fix me -->
          <div
            v-if="!options.united"
            v-for="metric in metricsName"
            :key="metric.name"
            class="option-item"
          >
            <div

              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              {{ metric.name }} units
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Единицы измерения для линии {{ metric.name }}
            </div>
            <div class="status-option item">
              <v-text-field
                v-model="metricUnits[metric.name]"
                clearable
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="subnumber"
                hide-details
              />
            </div>
          </div>

          <!-- @todo: fix me -->
          <v-card-text
            v-if="options.united && options.barplotstyle !== 'accumulation' && checkOptions('united')"
            class="headline pa-0"
          >
            <div
              class="settings-title"
              :style="{color:theme.$main_text,borderColor:theme.$main_border}"
            >
              Выбор типа графика
            </div>
          </v-card-text>
          <div
            v-if="options.united && options.barplotstyle !== 'accumulation' && checkOptions('united')"
            class="options-block united-block pa-0"
          >
            <div class="multiline-custom-opts">
              <div style="margin-left: 350px">
                <div
                  v-for="(metric, i) in Object.keys(multilineYAxesBinding.metricTypes)"
                  :key="`metric-${i}`"
                  class="d-flex pb-3"
                >
                  <span :style="{ color: theme.$main_text }">
                    Тип графика
                    <span :style="{ color: theme.$accent_ui_color }" v-text="metric"/>:
                  </span>
                  <v-radio-group
                    v-model="multilineYAxesBinding.metricTypes[metric]"
                    hide-details
                    :column="false"
                    class="ma-0 ml-5"
                  >
                    <v-radio
                      :color="theme.$primary_button"
                      :style="{ color:theme.$main_text }"
                      label="Линейный"
                      :value="'linechart'"
                    />
                    <v-radio
                      :color="theme.$primary_button"
                      :style="{ color:theme.$main_text }"
                      class="ml-2"
                      label="Столбчатый"
                      :value="'barplot'"
                    />
                  </v-radio-group>
                </div>
              </div>
            </div>
          </div>
          <v-card-text
            v-if="options.united && options.barplotstyle !== 'accumulation' && checkOptions('united')"
            class="headline pa-0"
          >
            <div
              class="settings-title"
              :style="{color:theme.$main_text,borderColor:theme.$main_border}"
            >
              Привязка осей
            </div>
          </v-card-text>

          <!-- @todo: fix me -->
          <div
            v-if="options.united && options.barplotstyle !== 'accumulation' && checkOptions('united')"
            class="options-block united-block pa-0"
          >
            <div class="d-flex multiline-custom-opts">
              <v-radio-group
                v-model="multilineYAxesBinding.axesCount"
                style="margin-left: 350px; margin-top: 0;"
              >
                <v-radio
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  label="Одна ось"
                  :value="1"
                />
                <v-radio
                  :color="theme.$primary_button"
                  :style="{color:theme.$main_text}"
                  label="Две оси"
                  :value="2"
                />
              </v-radio-group>

              <div
                v-if="multilineYAxesBinding.axesCount === 2"
                style="margin-left: 50px"
              >
                <div
                  v-for="(metric, i) in Object.keys(multilineYAxesBinding.metrics)"
                  :key="`metric-${i}`"
                  class="pb-3"
                >
                  <div class="d-flex align-center">
                    <span :style="{ color: theme.$main_text }">
                      Привязка
                      <span :style="{ color: theme.$accent_ui_color }" v-text="metric"/>:
                    </span>
                    <v-radio-group
                      v-model="multilineYAxesBinding.metrics[metric]"
                      hide-details
                      :column="false"
                      class="ma-0 ml-5"
                    >
                      <v-radio
                        :color="theme.$primary_button"
                        :style="{ color:theme.$main_text }"
                        label="Слева"
                        :value="'left'"
                      />
                      <v-radio
                        :color="theme.$primary_button"
                        :style="{ color:theme.$main_text }"
                        class="ml-2"
                        label="Справа"
                        :value="'right'"
                      />
                    </v-radio-group>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- @todo: fix me -->
          <v-card-text
            v-if="!options.united && checkOptions('united')"
            class="headline"
          >
            <div
              class="settings-title"
              :style="{color:theme.$main_text,borderColor:theme.$main_border}"
            >
              Настройки режима United
            </div>
          </v-card-text>
          <div
            v-if="!options.united && checkOptions('united')"
            class="options-block united-block"
          >
            <v-icon
              v-if="metrics.length==0"
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
                v-model="metrics[i-1].name"
                :items="metricsName.map(el => el.name)"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, fill: theme.$main_text}"
                hide-details
                outlined
                class="item-metric"
                label="Имя метрики"
                @click="changeColor"
              />
              <v-select
                v-model="metrics[i-1].type"
                :items="types"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, fill: theme.$main_text}"
                hide-details
                outlined
                class="item-metric"
                label="Тип графика"
                @click="changeColor"
              />
              <v-text-field
                v-model="metrics[i-1].lowborder"
                clearable
                placeholder="0"
                label="Нижняя граница (ось Y)"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                :disabled="metrics[i-1].manual"
                outlined
                class="item-metric border"
                hide-details
              />
              <v-text-field
                v-model="metrics[i-1].upborder"
                clearable
                placeholder="0"
                label="Верхняя граница (ось Y)"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                :disabled="metrics[i-1].manual"
                outlined
                class="item-metric border"
                hide-details
              />
              <br />
              <div class="item-metric">
                <div
                  class="discribe-option item"
                  :style="{color:theme.$main_text, borderColor:theme.$main_border}"
                >
                  Цвет
                </div>
                <div class="status-option item">
                  <input :value="color[metrics[i-1].name]" @change="(e) => handleChangeColor(e, i-1)" style="width: 100px; cursor: pointer;" type="color" name="multiline-color">
                </div>
              </div>
              <div>
                <div class="status-option item">
                  <v-text-field
                    :value="conclusion_count[metrics[i-1].name]"
                    clearable
                    :color="theme.$primary_button"
                    :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                    style="min-width: 100px"
                    outlined
                    @input="e => handleChangeConlusionCount(e, i - 1)"
                    class="item-metric"
                    label="Вывод значений"
                    type="number"
                    hide-details
                  />
                </div>
              </div>
              <div>
                <div class="status-option item">
                  <v-text-field
                    :value="replace_count[metrics[i-1].name]"
                    clearable
                    :color="theme.$primary_button"
                    :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                    style="min-width: 100px"
                    outlined
                    @input="e => handleChangeReplaceCount(e, i - 1)"
                    class="item-metric"
                    label="Значения после запятой"
                    type="number"
                    hide-details
                  />
                </div>
              </div>
              <div>
                <div class="status-option item">
                  <v-select
                    :value="type_line[metrics[i-1].name]"
                    :disabled="metrics[i-1].type === 'Bar chart'"
                    label="Тип линии"
                    class="item-metric"
                    :items="[
                      {
                        text: '━━━━━━',
                        value: 'solid'
                      },
                      {
                        text: '-------------------',
                        value: 'dashed'
                      },
                      {
                        text: '.........................',
                        value: 'dotted'
                      },
                      {
                        text: '﹎﹎﹎﹎﹎﹎',
                        value: 'double'
                      },
                    ]"
                    :color="theme.$primary_button"
                    :style="{color:theme.$main_text, fill: theme.$main_text}"
                    hide-details
                    outlined
                    @change="e => handleChangeTypeLine(e, i-1)"
                  />
                </div>
              </div>
              <v-checkbox
                v-model="metrics[i-1].manual"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text}"
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
                @click="deleteMetrics(i-1)"
              >
                {{ minus_icon }}
              </v-icon>
            </div>
          </div>

          <!-- @todo: fix me -->
          <div
            v-if="checkOptions('positionlegend')"
            class="option-item"
          >
            <div
              class="name-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              positionlegend
            </div>
            <div
              class="discribe-option item"
              :style="{color:theme.$main_text, borderColor:theme.$main_border}"
            >
              Позиция легенды
            </div>
            <div class="status-option item">
              <v-select
                v-model="options.positionlegend"
                :items="['top','left','right','bottom']"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, fill: theme.$main_text}"
                hide-details
                outlined
                class="subnumber"
                label="Позиция легенды"
                @click="changeColor"
              />
            </div>
          </div>

          <!-- @todo: fix me -->
          <div
            v-if="checkOptions('primitivesLibrary')"
            class="option-item"
          >
            <v-container fluid>
              <v-card-text
              class="headline"
            >
              <div
                class="settings-title"
                :style="{color:theme.$main_text,borderColor:theme.$main_border}"
              >
                Библиотека примитивов отображения
              </div>
            </v-card-text>
              <v-btn
                plain link small
                class="mb-3 text-lowercase"
                :color="theme.$main_text"
                @click="primitivesLibraryAutoGrow = !primitivesLibraryAutoGrow">
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
              ></v-textarea>
              <v-btn
                  v-if="primitivesLibraryAutoGrow"
                  plain link small
                  class="text-lowercase"
                  :color="theme.$main_text"
                  @click="primitivesLibraryAutoGrow = !primitivesLibraryAutoGrow">
                {{ primitivesLibraryAutoGrowLinkText }}
              </v-btn>
            </v-container>
          </div>

          <!-- @todo: fix me -->
          <v-card-text
            v-if="checkOptions('piechartSettings')"
            class="headline "
          >
            <div
              class="settings-title"
              :style="{color:theme.$main_text,borderColor:theme.$main_border}"
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
              :style="{color:theme.$main_text}"
            >
              <p>Соотношение метрик</p>
              <div
                :style="{backgroundColor:theme.$main_text}"
                class="divider-line"
              />
            </div>
            <div
              class="options-item-tooltip"
            >
              <v-select
                v-for="(label, i) in metricsRelation.namesMetric"
                :key="i+'metric'"
                v-model="metricsRelation.relations[i]"
                :items="metricsRelation.metrics"
                :label="metricsRelation.namesMetric[i]"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, fill: theme.$main_text}"
                hide-details
                outlined
                class="item-metric"
                @click="changeColor"
              />
            </div>
            <div
              class="divider-tooltip-setting"
              :style="{color:theme.$main_text}"
            >
              <p>Цветовая схема</p>
              <div
                :style="{backgroundColor:theme.$main_text}"
                class="divider-line"
              />
            </div>
            <div
              class="options-item-tooltip"
            >
              <v-select
                v-model="colorsPie.theme"
                :items="Object.keys(themes)"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, fill: theme.$main_text}"
                hide-details
                outlined
                class="item-metric"
                label="Выберите схему"
                @click="changeColor"
                @change="() => {
                  colorsPie.nametheme=colorsPie.theme === 'custom'?'':colorsPie.theme;
                  colorsPie.colors = themes[colorsPie.theme].join(',')
                }"
              />
              <v-text-field
                v-show="!defaultThemes.includes(colorsPie.theme)"
                v-model="colorsPie.nametheme"
                placeholder="green"
                label="Имя схемы"
                :color="theme.$primary_button"
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
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
                :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
                outlined
                class="item-metric"
                :class="{'disabled': !colorsPie.nametheme}"
                hide-details
              />
              <v-btn
                v-if="!defaultThemes.includes(colorsPie.theme) && colorsPie.theme !== 'custom'"
                :style="`background: ${theme.$secondary_bg}; color: ${theme.$main_text}`"
                :color="theme.$primary_button"
                @click="onClickDeleteTheme(colorsPie.theme)"
              >Удалить</v-btn>
            </div>
          </div>
        </div>

        <!-- @todo: fix me -->
        <v-card-text
          v-if="tooltipSettingShow"
          class="headline "
        >
          <div
            class="settings-title"
            :style="{color:theme.$main_text,borderColor:theme.$main_border}"
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
            :style="{color:theme.$main_text}"
          >
            <p>Текст</p>
            <div
              :style="{backgroundColor:theme.$main_text}"
              class="divider-line"
            />
          </div>
          <v-icon
            v-if="tooltip.texts.length==0"
            class="icon-plus"
            :color="theme.$primary_button"
            @click="addIntoTooltip('text')"
          >
            {{ plus_icon }}
          </v-icon>
          <div
            v-for="i in tooltip.texts.length"
            :key="i+'text'"
            class="options-item-tooltip"
          >
            <v-text-field
              v-model="tooltip.texts[i-1]"
              clearable
              placeholder="Введите текст tooltip"
              :color="theme.$primary_button"
              :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
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
              @click="deleteFromTooltip('text',i-1)"
            >
              {{ minus_icon }}
            </v-icon>
          </div>
          <div
            class="divider-tooltip-setting"
            :style="{color:theme.$main_text}"
          >
            <p>Ссылка</p>
            <div
              :style="{backgroundColor:theme.$main_text}"
              class="divider-line"
            />
          </div>
          <v-icon
            v-if="tooltip.links.length==0"
            class="icon-plus"
            :color="theme.$primary_button"
            @click="addIntoTooltip('link')"
          >
            {{ plus_icon }}
          </v-icon>
          <div
            v-for="i in tooltip.links.length"
            :key="i+'links'"
            class="options-item-tooltip"
          >
            <v-text-field
              v-model="tooltip.links[i-1].name"
              clearable
              placeholder="Введите название ссылки"
              :color="theme.$primary_button"
              :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
              outlined
              class="item-link"
              hide-details
            />
            <v-text-field
              v-model="tooltip.links[i-1].url"
              clearable
              placeholder="Введите текст ссылки"
              :color="theme.$primary_button"
              :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
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
              @click="deleteFromTooltip('link',i-1)"
            >
              {{ minus_icon }}
            </v-icon>
          </div>
          <div
            class="divider-tooltip-setting"
            :style="{color:theme.$main_text}"
          >
            <p>Кнопка</p>
            <div
              :style="{backgroundColor:theme.$main_text}"
              class="divider-line"
            />
          </div>
          <v-icon
            v-if="tooltip.buttons.length==0"
            class="icon-plus"
            :color="theme.$primary_button"
            @click="addIntoTooltip('button')"
          >
            {{ plus_icon }}
          </v-icon>
          <div
            v-for="i in tooltip.buttons.length"
            :key="i+'button'"
            class="options-item-tooltip"
          >
            <v-text-field
              v-model="tooltip.buttons[i-1].name"
              clearable
              placeholder="Введите название кнопки"
              :color="theme.$primary_button"
              :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
              outlined
              class="item-button"
              hide-details
            />
            <v-text-field
              v-model="tooltip.buttons[i-1].id"
              clearable
              placeholder="Введите id кнопки"
              :color="theme.$primary_button"
              :style="{color:theme.$main_text, background: 'transparent', borderColor: theme.$main_border}"
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
              @click="deleteFromTooltip('button',i-1)"
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

import settings from '../js/componentsSettings.js'

import { mdiPlusBox, mdiMinusBox } from '@mdi/js'
import { mapGetters } from 'vuex';

export default {
  props: {
    idDashFrom: null,
  },
  data() {
    return {
      tableTitles:[],
      element: '',
      openNewScreen: false,
      primitivesLibraryAutoGrow: false,
      conclusion_count: {},
      replace_count: {},
      options: {
      },
      type_line: 'solid',
      color: {},
      optionsItems: [],
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
        namesMetric: ['Категория','Процентное соотношение']
      },
      colorsPie: {
        theme: 'neitral',
        colors: '',
        nametheme: ''
      },
      defaultThemes: ['neitral', 'indicted'],
      themesArr: [],
      themes: {},
      metrics: [],
      types: ['Line chart', 'Bar chart'],
      metricsName: [],
      multilineYAxesBinding: { axesCount: 1, metrics: {}, metricTypes: {} },
      multilineYAxesTypes: {},
      metricUnits: {},

      // @todo: перенести в визуализации
      fieldsForRender: [

        // dashBoard
        {
          option: 'visible',
          description: 'Показывает / скрывает элемент',
          elem: 'switch',
        },
        {
          option: 'pinned',
          description: 'Закрепить на всех вкладках',
          elem: 'switch',
        },
        {
          option: 'level',
          description: 'Установить слой отображения элемента',
          elem: 'text-field',
        },
        {
          option: 'lastResult',
          description: 'Вывод предыдущих результатов',
          elem: 'switch',
        },

        // dashTextArea
        {
          option: 'boxShadow',
          description: 'Добавляет / удаляет тень',
          elem: 'switch',
        },
        {
          option: 'searchBtn',
          description: 'Показывать кнопку поиска',
          elem: 'switch',
        },

        // dashMap
        {
          option: 'osmserver',
          description: 'Сервер для набора tile Пример:\nhttp://192.168.4.209/osm/{z}/{x}/{y}.png',
          elem: 'text-field',
        },

        // MultiLine
        {
          option: 'strokeWidth',
          description: 'Толщина линий',
          elem: 'text-field',
        },
        {
          option: 'thememultiline',
          description: 'Цветовая тема',
          elem: 'select',
          items: ['default', 'Anna theme'],
        },

        // dashSingle
        {
          option: 'subnumber',
          description: 'Выводит дополнительную надпись под числом',
          elem: 'text-field',
        },

        // dashTable
        {
          option: 'rowcolor',
          description: 'Выбрать цвет которым подсветится нужная строка',
          elem: 'text-field',
        },
        {
          option: 'columncolor',
          description: 'Выбрать цвет которым подсветится нужный столбец',
          elem: 'text-field',
        },
        {
          option: 'cellcolor',
          description: 'Выбрать цвет которым подсветится нужная ячейка',
          elem: 'text-field',
        },

        // dashSingle, dashButton
        {
          option: 'color',
          description: 'Выбрать цвет значения',
          elem: 'text-field',
        },

        // dashButton
        {
          option: 'backgroundcolor',
          description: 'Выбрать цвет фона',
          elem: 'text-field',
        },

        // dashButton, MultiLine
        {
          option: 'name',
          description: 'Выбрать название кнопки',
          elem: 'text-field',
        },

        // dashTable
        {
          option: 'titles',
          description: 'Столбцы для отображения',
          elem: 'checkbox-list',
          items: () => this.getAvailableTableTitles(this.idDash, this.element), // @todo: fix me
          onChange: $event => this.titleHandler($event) // @todo: fix me
        },

        // @todo: fix me for: dashHeatMap, (maybe dashTable, dashTable)
        {
          group: 'Формат данных',
          option: 'dataFormat',
        },
        {
          optionGroup: 'dataFormat',
          option: 'x',
          description: 'X axis',
          elem: 'select',
          items: () => this.tableTitles, // @todo: fix me
        },
        {
          optionGroup: 'dataFormat',
          option: 'xFormat',
          description: 'X-axis format',
          elem: 'select',
          items: ['Дата', 'Строка', 'Число'],
          // default: 'Строка',
        },
        {
          optionGroup: 'dataFormat',
          option: 'xSort',
          description: 'Sorting by x-axis',
          elem: 'select',
          items: ['По возрастанию', 'По убыванию'],
          // default: 'По возрастанию',
        },
        {
          optionGroup: 'dataFormat',
          option: 'y',
          description: 'Y axis',
          elem: 'select',
          items: () => this.tableTitles, // @todo: fix me
        },
        {
          optionGroup: 'dataFormat',
          option: 'yFormat',
          description: 'Y-axis format',
          elem: 'select',
          items: ['Дата', 'Строка', 'Число'],
          // default: 'Дата',
        },
        {
          optionGroup: 'dataFormat',
          option: 'ySort',
          description: 'Sorting by y-axis',
          elem: 'select',
          items: ['По возрастанию', 'По убыванию'],
          // default: 'По возрастанию',
        },
        {
          optionGroup: 'dataFormat',
          option: 'data',
          description: 'Значение ячейки',
          elem: 'select',
          items: () => this.tableTitles, // @todo: fix me
        },
        {
          optionGroup: 'dataFormat',
          option: 'metadata',
          description: 'metadata',
          elem: 'select',
          items: () => this.tableTitles, // @todo: fix me
        },
        {
          optionGroup: 'dataFormat',
          option: 'detailValue',
          description: 'Поле для ссылки Детали',
          elem: 'select',
          items: () => this.tableTitles, // @todo: fix me
        },

        // MultiLine, dashBoard
        {
          option: 'timeFormat',
          description: 'Выбрать формат даты и времени',
          elem: 'text-field',
          placeholder: '%Y-%m-%d %H:%M:%S',
        },

        // dashBoard
        {
          option: 'widthTile',
          description: 'Введите ширину плитки',
          elem: 'text-field',
          placeholder: '100',
        },
        {
          option: 'heightTile',
          description: 'Введите высоту плитки',
          elem: 'text-field',
          placeholder: '100',
        },

        // dashSingle
        {
          option: 'fontSize',
          description: 'Выбрать размер шрифта',
          elem: 'text-field',
          placeholder: '30',
        },

        // dashButton
        {
          option: 'underline',
          description: 'Подчеркивает текст кнопки',
          elem: 'switch',
        },
        {
          label: 'Submit',
          option: 'onButton',
          description: 'Перезапускать серчи по кнопке',
          elem: 'switch',
        },

        // MultiLine
        {
          option: 'lastDot',
          description: 'Показывать последнее значение',
          elem: 'switch',
        },
        {
          option: 'isDataAlwaysShow',
          description: 'Постоянное отображение данных на графике',
          elem: 'radio-group',
          items: [
            { value: false, label: 'False' },
            { value: 'data', label: 'data' },
            { value: 'caption', label: 'caption' },
          ],
        },
        {
          option: 'xAxisCaptionRotate',
          description: 'Градус наклона подписей на оси X',
          elem: 'radio-group',
          items: [
            { value: 0, label: '0' },
            { value: 45, label: '45' },
            { value: -45, label: '-45' },
            { value: 90, label: '90' },
            { value: -90, label: '-90' },
          ],
        },
        {
          option: 'barplotBarWidth',
          description: 'Ширина столбцов барплот-графика',
          elem: 'text-field',
          elemType: 'number',
          elemMin: 0,
          onChange: val => {
            console.log('onChange', val)
            if (val < 1) this.options.barplotBarWidth = 0
          },
        },
        {
          option: 'stringOX',
          description: 'Ось X - строки',
          elem: 'switch',
        },
        {
          option: 'united',
          description: 'Отображать ли все метрики на одной плоскости координат',
          elem: 'switch',
        },
        {
          option: 'barplotstyle',
          relation: 'united',
          description: 'Стиль столбцов',
          elem: 'select',
          items: [
            {text:'разделенный', value:'divided'},
            {text:'наложенный', value:'overlay'},
            {text:'с накоплением', value:'accumulation'},
          ],
        },

        // dashSelect
        {
          option: 'multiple',
          description: 'Возможность выбора нескольких значений',
          elem: 'switch',
        },

        // dashMap, dashPieChart
        {
          option: 'showlegend',
          description: 'Показывать ли легенду',
          elem: 'switch',
        },

      ]

    }
  },
  computed: {
    active: function() {  // тут понимаем нужно ли открыть окно с созданием или нет
      if (this.$store.getters.getModalSettings(this.idDash).status){ // если окно должно быть открыто
        this.element = this.$store.getters.getModalSettings(this.idDash).element;  // получаем для каокго элемнета вывести настройки
        if (this.element.indexOf('csvg') !== -1) {
          this.tooltipSettingShow = true;
        } else {
          this.tooltipSettingShow = false;
        }
        this.prepareOptions();  // и подготовливаем модалку на основе этого элемента
        this.metricsName = this.$store.getters.getMetricsMulti({idDash: this.idDash, id: this.element});
        if (this.element.startsWith("multiLine")) {
          const opt = this.$store.getters.getOptions({idDash: this.idDash, id: this.element})
          
          if (opt.conclusion_count) {
            this.conclusion_count = opt.conclusion_count
          }

          if (opt.yAxesBinding) {
            this.multilineYAxesBinding.axesCount = opt.yAxesBinding.axesCount
          } else {
            this.multilineYAxesBinding.axesCount = 1
          }

          
          if (opt.type_line) {
            this.type_line = opt.type_line;
          }

          if (opt.color) {
            this.color = opt.color;
          }

          this.metricsName.forEach(metric => {
            this.metricUnits[metric.name] = metric.units;
            if (opt.yAxesBinding && opt.yAxesBinding.metrics && opt.yAxesBinding.metricTypes) {
              this.multilineYAxesBinding.metrics[metric.name] = opt.yAxesBinding.metrics[metric.name]
              this.multilineYAxesBinding.metricTypes[metric.name] = opt.yAxesBinding.metricTypes[metric.name]
            } else {
              this.multilineYAxesBinding.metrics[metric.name] = 'left'
              this.multilineYAxesBinding.metricTypes[metric.name] = 'linechart'
            }
          })
        }
      }
      return this.$store.getters.getModalSettings(this.idDash).status;
    },
    idDash: function(){
      return this.idDashFrom
    },
    theme: function() {
      return this.$store.getters.getTheme
    },
    selectedTitles() {
      return this.$store.getters.getSelectedTableTitles(this.idDash, this.element);
    },
    primitivesLibraryAutoGrowLinkText() {
      return this.primitivesLibraryAutoGrow ? 'Свернуть поле' : 'Расширить поле'
    },

    ...mapGetters([
      'getAvailableTableTitles',
      'getSelectedTableTitles',
      'getAvailableDataFormat',
      'getSelectedDataFormat',
    ]),

  },
  watch: {
    element(val) {
      console.log('watch element ' + val)
      const options = this.$store.getters.getOptions({idDash: this.idDash, id: this.element}); // получаем все опции
      console.log('options', { ...options }, { ...this.options })
    },
    selectedTitles(newValue) {
      this.tableTitles = newValue;
    },
    active(status){
      if (!status) {
        // set default empty value
        this.multilineYAxesBinding = { axesCount: 1, metrics: {}, metricTypes: {} }
      }
    }
  },
  mounted() {
    console.log('mount settings ' + this.idDashFrom)
    this.tableTitles = this.getSelectedTableTitles(this.idDashFrom);
    // this.$store.commit('setModalSettings',  { idDash: this.idDash, status: false, id: '' } );
  },
  methods: {
    handleChangeColor(e, i) {
      this.color = { ...this.color, [this.metrics[i].name]: e.target.value };
    },
    handleChangeTypeLine(e, i) {
      this.type_line = { ...this.type_line, [this.metrics[i].name]: e }
    },

    handleChangeConlusionCount(e, i) {
      this.conclusion_count = { ...this.conclusion_count, [this.metrics[i].name]: Number(e) }
    },

    handleChangeReplaceCount(e, i) {
      this.replace_count = { ...this.replace_count, [this.metrics[i].name]: Number(e) }
    },
    titleHandler(val) {
      let temp = []
      let orderArray = this.getAvailableTableTitles(this.idDash, this.element);
      for (let setting of val) {
        let index = orderArray.indexOf(setting);
        temp.push({setting, index})
      }
      temp.sort((a, b) => a.index - b.index)
      this.tableTitles = temp.map((el) => el.setting)
    },
    setOptions: function() {  // отправляем настройки в хранилище
      if(!this.options.level){
        this.options.level = 1;
      }

      if(typeof this.options.timeFormat != 'undefined' && this.options.timeFormat == null){
        this.options.timeFormat = '%Y-%m-%d %H:%M:%S';
      }
      if(typeof this.options.size != 'undefined') {
        if ( this.options.size == null){
          this.options.size = '100px';
        } else if (String(this.options.size).indexOf('px') == -1) {
          this.options.size = `${this.options.size}px`;
        }
      }
      //let options = {...{},...this.options};
      if (this.element.indexOf('csvg') != -1) {
        this.options.tooltip = this.tooltip;
      }
      if (this.element.indexOf('piechart') != -1) {
        this.options.metricsRelation = JSON.parse(JSON.stringify(this.metricsRelation));
        if (this.colorsPie.nametheme) {
          this.options.colorsPie = this.colorsPie;
          if (!this.defaultThemes.includes(this.colorsPie.nametheme)) {
            this.themes[this.colorsPie.nametheme] = this.colorsPie.colors.split(',')
            if (this.colorsPie.theme !== 'custom' && this.colorsPie.theme !== this.colorsPie.nametheme) {
              delete this.themes[this.colorsPie.theme]
            }
            this.colorsPie.theme = this.colorsPie.nametheme;
          }
          this.options.themes = this.themes;
        }

      }
      if (this.element.indexOf('multiLine') != -1) {
        let updateMetrics = this.metrics.map( item => {
          return JSON.parse(JSON.stringify(item))
        })
        this.$set(this.options,'metrics',updateMetrics);
      }
      if (this.element.startsWith("multiLine")) {
        this.$store.commit('setMultilineMetricUnits', { idDash: this.idDash, elem: this.element, units: this.metricUnits})
        this.options.yAxesBinding = { ...this.multilineYAxesBinding }
      }
      this.$store.commit('setOptions',  { idDash: this.idDash, id: this.element, options: { ...this.options, conclusion_count: this.conclusion_count, replace_count: this.replace_count, openNewScreen: this.openNewScreen, type_line: this.type_line, color: this.color  }, titles: this.tableTitles});
      this.cancelModal();
    },
    cancelModal: function() {  // если нажали на отмену создания
      this.$store.commit('setModalSettings',  { idDash: this.idDash, status: false, id: '' } );
    },
    checkEsc: function(event) {
      if (event.code =="Escape") {
        this.cancelModal();
      }
    },
    checkOptions: function(option, relation) { // проверяет есть ли такая опция уже в массиве с опциями
      if (relation !== undefined && !this.options[relation]) {
        return false;
      }
      return this.optionsItems.includes(option)
    },
    addIntoTooltip: function(item) {
      if (item == 'text') {
        this.tooltip.texts.push('');
      } else if (item == 'link') {
        this.tooltip.links.push({name: '',url: ''});
      } else if (item == 'button') {
        this.tooltip.buttons.push({name: '',id: ''});
      }
    },
    addMetrics: function() {
      this.metrics.push({name: '', type: '', upborder: 0, lowborder: 0, manual: true})
    },
    deleteFromTooltip: function(item,i) {

      if (item == 'text') {
        this.tooltip.texts.splice(i, 1);
      }  else if (item == 'link') {
        this.tooltip.links.splice(i, 1);
      }  else if (item == 'button') {
        this.tooltip.buttons.splice(i, 1);
      }
    },
    deleteMetrics: function(i) {
      this.metrics.splice(i, 1);
    },
    changeColor: function() {
      if (document.querySelectorAll('.v-menu__content').length != 0){

        document.querySelectorAll('.v-menu__content').forEach( item => {

          item.style.boxShadow = `0 5px 5px -3px ${this.theme.$main_border},0 8px 10px 1px ${this.theme.$main_border},0 3px 14px 2px ${this.theme.$main_border}`;
          item.style.background = this.theme.$main_bg;
          item.style.color = this.theme.$main_text;
          item.style.border = `1px solid ${this.theme.$main_border}`;
        })
      }
    },
    prepareOptions() {  //  понимает какие опции нужно вывести
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.element}); // получаем все опции
      console.log('prepareOptions options', {...options})
      let elem = this.element.split('-')[0];  // понимаем какой тип элемента попал к нам

      if (options.color) {
        this.color = options.color;
      }

      if (options.type_line) {
        this.type_line = options.type_line;
      }

      if (options.conclusion_count) {
        this.conclusion_count = options.conclusion_count
      }

      if (options.replace_count) {
        this.replace_count = options.replace_count
      }

      console.log('prepareOptions settings.options[elem]', settings.options[elem])
      this.options = {};
      this.optionsItems = settings.options[elem];

      // @todo: fix me
      this.optionsItems.forEach( item => {
        if (Object.keys(options).includes(item)) {
          if (item == 'tooltip') {
            this.tooltip = {};
            this.$set(this.tooltip,'texts', [...[],...options[item].texts]);
            this.$set(this.tooltip,'links', [...[],...options[item].links]);
            this.$set(this.tooltip,'buttons',[...[],...options[item].buttons]);
          } else if (item == 'metrics') {
            //this.$set(this,'metrics',options[item]);
            this.metrics = options[item];
          } else if (item == 'metricsRelation') {
            this.metricsRelation = {};
            this.$set(this.metricsRelation,'metrics', [...[],...options[item].metrics]);
            this.$set(this.metricsRelation,'relations', [...[],...options[item].relations]);
            this.$set(this.metricsRelation,'namesMetric', ['Категория','Процентное соотношение']);
          } else if (item == 'colorsPie') {
            this.colorsPie = {};
            this.$set(this.colorsPie,'theme', options[item].theme);
            this.$set(this.colorsPie,'colors', options[item].colors);
            this.$set(this.colorsPie,'nametheme', options[item].nametheme);
          } else if (item == 'themes') {
            this.themesArr = Object.keys(options[item]);
            this.themes = options[item];
          } else {
            this.$set(this.options,item,options[item]);
          }
        } else {
          this.$set(this.options,item,null);
          let propsToFalse = [
            'stringOX', 'united', 'isDataAlwaysShow', 'lastDot', 'multiple',
            'underline', 'onButton', 'pinned'
          ];
          if (propsToFalse.includes(item)) {
            this.$set(this.options, item, false);
          }
          if (item == 'barplotstyle') {
            this.$set(this.options,item,'divided');
          }
          if (item === 'xAxisCaptionRotate') {
            this.$set(this.options, item, 0);
          }
          if (item === 'barplotBarWidth') {
            this.$set(this.options, item, 0);
          }
          if (item == 'showlegend') {
            this.$set(this.options,item,true);
          }
          if (item == 'positionlegend') {
            this.$set(this.options,item,'right');
          }
          if (item == 'metrics') {
            this.metrics = [];
          }
        }
      })
      if (!this.options.change) {
        this.$set(this.options,'change',false);
      }
    },
    onClickDeleteTheme(theme) {
      const nextTheme = this.defaultThemes[0]
      this.colorsPie.theme = nextTheme;
      this.colorsPie.nametheme = nextTheme;
      this.colorsPie.colors = this.themes[nextTheme].join(',');
      this.options.colorsPie = this.colorsPie;
      this.options.themes = this.themes;
      delete this.themes[theme]
    }
  },
}
</script>

<style lang="scss">
  @import '../sass/modalSettings.sass';
</style>
