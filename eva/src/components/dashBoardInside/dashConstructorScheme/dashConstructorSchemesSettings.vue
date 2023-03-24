<template>
  <div
    v-if="dataObject"
    ref="dataPanelItems"
    class="dash-constructor-schemes__data-panel-wrapper"
  >
    <div class="dash-constructor-schemes__data-panel-item pb-4">
      <template v-if="dataType === 'data-type-0'">
        <!--data-type-0-->
        <div class="row justify-content-between align-center">
          <div class="col text-left">
            Ручной ввод TagName:
          </div>
          <div class="col-auto">
            <v-switch
              v-model="textMode"
              dense
            />
          </div>
        </div>
        <div
          v-for="(element, index) in dataObject.items"
          :key="`${dataObject.nodeId}-${index}`"
          class="column dash-constructor-schemes__data-type-0"
        >
          <div class="row align-center relative">
            <v-text-field
              v-if="textMode"
              v-model="element.id"
              label="TagName поля с данными"
              class="col-11 pb-0"
            />
            <v-autocomplete
              v-else
              v-model="element.id"
              :style="{ color: theme.$main_text }"
              :items="dataRestFrom"
              item-value="TagName"
              item-text="Description"
              label="Значение"
              :filter="tagNameAutocompleteFilter"
              class="col-11 pb-0"
            >
              <template v-slot:item="{ item, on }">
                <v-list-item
                  ripple
                  class="v-list-item--link dash-constructor-schemes__data-panel-select"
                  v-on="on"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ item.Description }}
                    </v-list-item-title>
                    <v-list-item-subtitle :style="{ color: theme.$secondary_text }">
                      {{ item.NameObject }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-autocomplete>
            <v-icon
              v-if="dataObject.items.length > 1"
              class="
                control-button
                edit-icon
                theme--dark
                col-2
                pa-0
                absolute
                absolute--top
                absolute--right
              "
              :style="{ color: theme.$secondary_text }"
              @click="deleteLine(index, 'items')"
            >
              {{ closeIcon }}
            </v-icon>
            <div
              class="col-12 mb-8 py-0 text-left"
              :style="{ color: theme.$secondary_text }"
            >
              {{ element.id | getObjectNameById(dataRestFrom) }}
            </div>
            <v-text-field
              v-model="element.description"
              label="Подпись"
              :color="theme.$accent_ui_color"
              :style="{ color: theme.$main_text }"
              class="col-11 py-0"
            />
          </div>
        </div>
        <div class="row align-center mb-9">
          <div class="col-9 text-left">
            Добавить строку:
          </div>
          <div class="col-3">
            <v-btn
              ripple
              small
              height="36"
              width="64"
              color="transparent"
              @click="addLine(
                elementTemplates['data-type-0'].dataRest.items[0],
                'items',
              )"
            >
              <v-icon
                class="control-button edit-icon theme--dark"
                :style="{ color: theme.$main_text }"
              >
                {{ addLineIcon }}
              </v-icon>
            </v-btn>
          </div>
        </div>
        <div class="dash-constructor-schemes__slider column align-stretch">
          <div class="mb-4">
            Размер подложки таблицы:
          </div>
          <div class="dash-constructor-schemes__slider-title">
            <div>
              <span>{{ dataObject.widthLeft }}</span>
              <span>%</span>
            </div>
            <div>
              <span>{{ dataObject.widthLeft | revertValue }}</span>
              <span>%</span>
            </div>
          </div>
          <v-slider
            :value="dataObject.widthLeft"
            max="90"
            min="10"
            @input="updateSliderValue"
          />
        </div>
        <v-btn
          small
          outlined
          :color="theme.$primary_button"
          :style="{ color: theme.$main_text }"
          @click="updateModelValue"
        >
          Применить
        </v-btn>
      </template>
      <template v-if="dataType === 'data-type-1'">
        <!--data-type-1-->
        <div class="column">
          <div class="row justify-content-between align-center mb-8">
            <div class="col text-left">
              Ручной ввод TagName:
            </div>
            <div class="col-auto">
              <v-switch
                v-model="textMode"
                dense
              />
            </div>
            <v-text-field
              v-if="textMode"
              v-model="dataObject.id"
              label="TagName поля с данными"
              class="col-11 pb-0"
              @change="updateModelValue(dataObject)"
            />
            <v-autocomplete
              v-else
              v-model="dataObject.id"
              :items="dataRestFrom"
              item-value="TagName"
              item-text="Description"
              label="Данные для строки"
              :filter="tagNameAutocompleteFilter"
              class="col-11 pb-0"
            >
              <template v-slot:item="{ item, on }">
                <v-list-item
                  ripple
                  class="v-list-item--link dash-constructor-schemes__data-panel-select"
                  v-on="on"
                >
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ item.Description }}
                    </v-list-item-title>
                    <v-list-item-subtitle :style="{ color: theme.$secondary_text }">
                      {{ item.NameObject }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-autocomplete>
            <div
              class="col-12 mb-8 py-0 text-left"
              :style="{ color: theme.$secondary_text }"
            >
              {{ dataObject.id | getObjectNameById(dataRestFrom) }}
            </div>
            <v-text-field
              v-model="dataObject.description"
              label="Подпись"
              :color="theme.$accent_ui_color"
              :style="{ color: theme.$main_text }"
              class="col-11 py-0"
            />
          </div>
          <v-btn
            small
            outlined
            :color="theme.$primary_button"
            :style="{ color: theme.$main_text }"
            @click="updateModelValue"
          >
            Применить
          </v-btn>
        </div>
      </template>
      <template v-if="dataType === 'data-type-2'">
        <!--data-type-3-->
        <div class="row align-center">
          <div class="col-12">
            <div
              v-for="(element, index) in dataObject.items"
              :key="`${dataObject.nodeId}-${index}`"
              class="column dash-constructor-schemes__data-type-2"
            >
              <div class="row align-center">
                <v-autocomplete
                  v-model="element.id"
                  :style="{ color: theme.$main_text }"
                  :items="dataRestFrom"
                  item-value="TagName"
                  item-text="Description"
                  label="Значение"
                  :filter="tagNameAutocompleteFilter"
                  :class="dataObject.items.length > 1 ? 'col-10' : 'col-12'"
                >
                  <template v-slot:item="{ item, on }">
                    <v-list-item
                      ripple
                      class="v-list-item--link dash-constructor-schemes__data-panel-select"
                      v-on="on"
                    >
                      <v-list-item-content>
                        <v-list-item-title>
                          {{ item.Description }}
                        </v-list-item-title>
                        <v-list-item-subtitle :style="{ color: theme.$secondary_text }">
                          {{ item.NameObject }}
                        </v-list-item-subtitle>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                </v-autocomplete>
                <v-icon
                  v-if="dataObject.items.length > 1"
                  class="control-button edit-icon theme--dark col-2"
                  :style="{ color: theme.$secondary_text }"
                  @click="deleteLine(index, 'items')"
                >
                  {{ closeIcon }}
                </v-icon>
              </div>
              <div
                class="mr-10 mb-3 text-left"
                :style="{ color: theme.$secondary_text }"
              >
                {{ element.id | getObjectNameById(dataRestFrom) }}
              </div>
              <div class="row align-center">
                <div class="col-8 text-left">
                  Цвет накопителя
                </div>
                <div class="col-4">
                  <v-menu
                    top
                    offset-x
                    :close-on-content-click="false"
                    z-index="100"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        :style="{
                          'background-color': element.bgColor.rgbaString,
                        }"
                        dark
                        v-bind="attrs"
                        v-on="on"
                      />
                    </template>

                    <v-color-picker
                      v-model="element.bgColor.rgbaObject"
                      dot-size="12"
                      mode="rgba"
                      @update:color="updateSelectedNodeColor($event, 'bgColor', index)"
                    />
                  </v-menu>
                </div>
                <div class="col-8 text-left">
                  Цвет текста
                </div>
                <div class="col-4">
                  <v-menu
                    top
                    offset-x
                    :close-on-content-click="false"
                    z-index="100"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        :style="{
                          'background-color': element.textColor.rgbaString,
                        }"
                        dark
                        v-bind="attrs"
                        v-on="on"
                      />
                    </template>

                    <v-color-picker
                      v-model="element.textColor.rgbaObject"
                      dot-size="12"
                      mode="rgba"
                      @update:color="updateSelectedNodeColor($event, 'textColor', index)"
                    />
                  </v-menu>
                </div>
              </div>
            </div>
            <div class="row align-center">
              <div class="col-8 text-left">
                Добавить строку:
              </div>
              <div class="col-4">
                <v-btn
                  ripple
                  small
                  height="36"
                  width="64"
                  color="transparent"
                  @click="addLine(
                    elementTemplates['data-type-2'].dataRest.items[0],
                    'items',
                  )"
                >
                  <v-icon
                    class="control-button edit-icon theme--dark"
                    :style="{ color: theme.$main_text }"
                  >
                    {{ addLineIcon }}
                  </v-icon>
                </v-btn>
              </div>
            </div>
            <div class="row align-center mb-9">
              <div class="col-8 text-left">
                Основной фон:
              </div>
              <div class="col-4">
                <v-menu
                  top
                  offset-x
                  :close-on-content-click="false"
                  z-index="100"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      :style="{
                        'background-color': dataObject.mainBgColor.rgbaString,
                      }"
                      dark
                      v-bind="attrs"
                      v-on="on"
                    />
                  </template>

                  <v-color-picker
                    v-model="dataObject.mainBgColor.rgbaObject"
                    dot-size="12"
                    mode="rgba"
                    @update:color="updateSelectedNodeColor($event, 'mainBgColor')"
                  />
                </v-menu>
              </div>
              <div class="col-8 text-left">
                Максимальный объем:
              </div>
              <div class="col-4">
                <v-text-field
                  v-model="dataObject.maxValue"
                  label=""
                  :color="theme.$main_text"
                  hide-details
                  style="margin-bottom: 10px"
                />
              </div>
              <div class="col-8 text-left">
                Размер текста
              </div>
              <div class="col-4">
                <v-text-field
                  v-model="dataObject.fontSize"
                  label=""
                  :color="theme.$main_text"
                  hide-details
                  dense
                  style="margin-bottom: 10px"
                />
              </div>
            </div>
          </div>
        </div>
        <v-btn
          small
          outlined
          :color="theme.$main_text"
          @click="updateModelValue(dataObject)"
        >
          Применить
        </v-btn>
      </template>
      <template v-if="dataType === 'data-type-3'">
        <!--data-type-3-->
        <div class="row align-center">
          <div class="col-12">
            <div class="row align-center">
              <v-text-field
                v-model="dataObject.defaultImage"
                label="Значение"
                class="col-11"
              />
            </div>
            <div class="row align-center mb-4">
              <v-autocomplete
                v-model="dataObject.id"
                :style="{ color: theme.$main_text }"
                :items="dataRestFrom"
                item-value="TagName"
                item-text="Description"
                label="Значение"
                :filter="tagNameAutocompleteFilter"
                class="col-11"
              >
                <template v-slot:item="{ item, on }">
                  <v-list-item
                    ripple
                    class="v-list-item&#45;&#45;link dash-constructor-schemes__data-panel-select"
                    v-on="on"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        {{ item.Description }}
                      </v-list-item-title>
                      <v-list-item-subtitle :style="{ color: theme.$secondary_text }">
                        {{ item.NameObject }}
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-autocomplete>
            </div>
            <div
              v-for="(element, index) in dataObject.imageList"
              :key="`${dataObject.nodeId}-${index}`"
              class="column dash-constructor-schemes__data-type-3"
            >
              <div class="row align-center">
                <v-text-field
                  v-model="element.image"
                  label="Изображение"
                  :class="dataObject.imageList.length > 1 ? 'col-10' : 'col-11'"
                />
                <v-icon
                  v-if="dataObject.imageList.length > 1"
                  class="control-button edit-icon theme--dark col-2"
                  :style="{ color: theme.$secondary_text }"
                  @click="deleteLine(index, 'imageList')"
                >
                  {{ closeIcon }}
                </v-icon>
              </div>
              <div class="row align-center">
                <v-text-field
                  v-model="element.value"
                  label="Значение"
                  class="col-11"
                />
              </div>
            </div>
            <div class="row align-center mb-4">
              <div class="col-9 text-left">
                Добавить изображение:
              </div>
              <div class="col-3">
                <v-btn
                  ripple
                  small
                  height="36"
                  width="64"
                  color="transparent"
                  @click="addLine(
                    elementTemplates['data-type-3'].dataRest.imageList[0],
                    'imageList'
                  )"
                >
                  <v-icon
                    class="control-button edit-icon theme--dark"
                    :style="{ color: theme.$main_text }"
                  >
                    {{ addLineIcon }}
                  </v-icon>
                </v-btn>
              </div>
            </div>
          </div>
        </div>
        <v-btn
          small
          outlined
          :color="theme.$main_text"
          @click="updateModelValue(dataObject)"
        >
          Применить
        </v-btn>
      </template>
      <template v-if="dataType === 'label-type-0'">
        <!--label-type-0-->
        <div class="row align-center text-left">
          <div class="col-12">
            <v-text-field
              v-model="dataObject.text"
              label="Текст"
              dense
              :color="theme.$main_text"
              style="margin-bottom: 10px"
              outlined
              hide-details
            />
          </div>
          <div class="col-8">
            Цвет текста:
          </div>
          <div class="col-4">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="100"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': dataObject.textColor.rgbaString,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.textColor.rgbaObject"
                dot-size="12"
                mode="rgba"
                @update:color="updateSelectedNodeColor($event, 'textColor')"
              />
            </v-menu>
          </div>
          <div class="col-12">
            <v-text-field
              v-model="dataObject.fontSize"
              label="Размер текста"
              dense
              :color="theme.$main_text"
              outlined
              hide-details
              style="margin-bottom: 10px"
            />
          </div>
          <div class="col-8">
            Цвет заливки:
          </div>
          <div class="col-4">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="100"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': dataObject.bgColor.rgbaString,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                :value="dataObject.bgColor.rgbaObject"
                dot-size="12"
                mode="rgba"
                @update:color="updateSelectedNodeColor($event, 'bgColor')"
              />
            </v-menu>
          </div>
          <div class="col-8">
            Верт. расположение:
          </div>
          <div class="col-4">
            <v-switch
              v-model="dataObject.isVertical"
            />
          </div>
          <div class="col-8">
            Отображение бордера:
          </div>
          <div class="col-4">
            <v-switch
              v-model="dataObject.bordered"
            />
          </div>
          <template v-if="dataObject.bordered">
            <div class="col-8">
              Цвет бордера:
            </div>
            <div class="col-4">
              <v-menu
                top
                offset-x
                :close-on-content-click="false"
                z-index="100"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    :style="{
                      'background-color': dataObject.borderColor.rgbaString,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  :value="dataObject.borderColor.rgbaObject"
                  dot-size="12"
                  mode="rgba"
                  @update:color="updateSelectedNodeColor($event, 'borderColor')"
                />
              </v-menu>
            </div>
            <div class="col-8">
              Пунктирный бордер:
            </div>
            <div class="col-4">
              <v-switch
                v-model="dataObject.borderDashed"
              />
            </div>
            <div class="col-12">
              <v-text-field
                v-model="dataObject.borderSize"
                label="Размер бордера"
                dense
                :color="theme.$main_text"
                outlined
                hide-details
                style="margin-bottom: 10px"
              />
            </div>
          </template>

          <div class="col-12">
            <v-text-field
              v-model="dataObject.value1"
              label="Значение value1"
              :color="theme.$main_text"
              outlined
              hide-details
              persistent-placeholder
              dense
            />
            <v-text-field
              v-model="dataObject.value2"
              label="Значение value2"
              class="mt-3"
              :color="theme.$main_text"
              outlined
              hide-details
              persistent-placeholder
              dense
            />
            <v-text-field
              v-model="dataObject.value3"
              label="Значение value3"
              class="mt-3"
              :color="theme.$main_text"
              outlined
              hide-details
              persistent-placeholder
              dense
            />
            <v-text-field
              v-model="dataObject.value4"
              label="Значение value4"
              class="mt-3"
              :color="theme.$main_text"
              outlined
              hide-details
              persistent-placeholder
              dense
            />
            <v-text-field
              v-model="dataObject.value5"
              label="Значение value5"
              class="mt-3"
              :color="theme.$main_text"
              outlined
              hide-details
              persistent-placeholder
              dense
            />
          </div>
        </div>
        <v-btn
          small
          class="mt-4"
          :color="theme.$primary_button"
          @click="updateModelValue(dataObject)"
        >
          Применить
        </v-btn>
      </template>
      <template v-if="dataType === 'shape-type-0'">
        <div class="row align-center text-left mb-8">
          <div class="col-8">
            Цвет блока:
          </div>
          <div class="col-4">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="100"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': `${dataObject.fill.rgbaString}`,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                :value="dataObject.fill.rgbaObject"
                dot-size="12"
                mode="rgba"
                @update:color="updateSelectedNodeColor($event, 'fill')"
              />
            </v-menu>
          </div>
          <div class="col-8">
            Цвет рамки блока:
          </div>
          <div class="col-4">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="100"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': `${dataObject.strokeColor.rgbaString}`,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                :value="dataObject.strokeColor.rgbaObject"
                dot-size="12"
                mode="rgba"
                @update:color="updateSelectedNodeColor($event, 'strokeColor')"
              />
            </v-menu>
          </div>
          <div class="col-8">
            Размер рамки:
          </div>
          <div class="col-4">
            <v-text-field
              v-model="dataObject.thickness"
              dense
            />
          </div>
          <div class="col-12">
            <v-autocomplete
              v-model="dataObject.shape"
              :items="shapeNodeStyleList"
              item-value="id"
              item-text="label"
              label="Фигура"
            />
          </div>
        </div>
        <v-btn
          small
          outlined
          :color="theme.$main_text"
          @click="updateModelValue(dataObject)"
        >
          Применить
        </v-btn>
      </template>
      <template v-if="dataType === 'edge'">
        <div class="row align-center text-left mb-8">
          <div class="col-8">
            Цвет линии:
          </div>
          <div class="col-4">
            <v-menu
              top
              offset-x
              :close-on-content-click="false"
              z-index="100"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  :style="{
                    'background-color': `${dataObject.strokeColor.rgbaString}`,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                :value="dataObject.strokeColor.rgbaObject"
                dot-size="12"
                mode="rgba"
                @update:color="updateSelectedNodeColor($event, 'strokeColor')"
              />
            </v-menu>
          </div>
          <div class="col-8">
            Размер линии:
          </div>
          <div class="col-4">
            <v-text-field
              v-model="dataObject.thickness"
              dense
            />
          </div>
          <div class="col-8">
            Скругление линии:
          </div>
          <div class="col-4">
            <v-text-field
              v-model="dataObject.smoothingLength"
              dense
            />
          </div>
        </div>
        <v-btn
          small
          outlined
          :color="theme.$main_text"
          @click="updateModelValue(dataObject)"
        >
          Применить
        </v-btn>
      </template>
    </div>
  </div>
</template>

<script>
import { mdiClose, mdiTableRowPlusAfter } from '@mdi/js';
import { throttle } from '@/js/utils/throttle';
import elementTemplates from '@/js/classes/ConstructorSchemes/elementTemplates';

export default {
  name: 'DashConstructorSchemesSettings',
  filters: {
    getObjectNameById(id, dataRest) {
      return dataRest.find((item) => item.TagName === id)?.NameObject || '-';
    },
    revertValue(value) {
      return 100 - value;
    },
  },
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
  props: {
    modelValue: {
      type: Object,
      default: () => ({}),
    },
    theme: {
      type: Object,
      required: true,
    },
    shapeNodeStyleList: {
      type: Array,
      default: () => ([]),
    },
    dataRestFrom: {
      type: Array,
      default: () => ([]),
    },
  },
  data() {
    return {
      dataObject: null,
      // Icons
      closeIcon: mdiClose,
      addLineIcon: mdiTableRowPlusAfter,
      test12345: 50,
      textMode: false,
      elementTemplates: elementTemplates.templates,
    };
  },
  computed: {
    dataType() {
      return this.dataObject.dataType;
    },
  },
  watch: {
    modelValue: {
      deep: true,
      handler(value) {
        this.dataObject = value;
      },
    },
  },
  mounted() {
    this.updateSelectedNodeColor = throttle(this.updateSelectedNodeColor, 200);
    this.updateSliderValue = throttle(this.updateSliderValue, 200);
  },
  methods: {
    tagNameAutocompleteFilter(data, str) {
      const subStr = str.toLowerCase();
      const fields = ['TagName', 'NameObject', 'Description'];
      // eslint-disable-next-line no-restricted-syntax
      for (const field of fields) {
        if (data[field] && data[field].toLowerCase().indexOf(subStr) !== -1) {
          return true;
        }
      }
      return false;
    },
    updateSelectedNodeColor(evt, field, index) {
      const updateValue = typeof index !== 'undefined'
        ? structuredClone(this.dataObject.items[index])
        : structuredClone(this.dataObject);
      updateValue[field] = {
        rgbaObject: evt.rgba,
        rgbaString: `rgba(${evt.rgba.r}, ${evt.rgba.g}, ${evt.rgba.b}, ${evt.rgba.a})`,
      };
      if (typeof index !== 'undefined') {
        this.$set(this.dataObject, 'items', this.dataObject.items.map((item, i) => {
          if (i === index) {
            return updateValue;
          }
          return item;
        }));
      } else {
        this.dataObject = updateValue;
      }
    },
    deleteLine(index, objectName) {
      this.dataObject[objectName].splice(index, 1);
    },
    addLine(template, objectName) {
      this.dataObject[objectName].push(template);
    },
    updateModelValue() {
      this.$emit('changeDataSelectedNode', this.dataObject);
      this.$emit('update:modelValue', this.dataObject);
    },
    updateSliderValue(value) {
      this.dataObject.widthLeft = value;
    },
  },
};
</script>

<style lang="scss" scoped>
.dash-constructor-schemes__data-panel-wrapper {
  .dash-constructor-schemes__data-panel-item {
    ::v-deep.v-text-field__details {
      display: none;
    }
    ::v-deep.theme--light.v-input {
      color: var(--main_text);
      .v-icon {
        color: var(--main-text);
      }
    }

    ::v-deep.v-list-item--link {
      max-width: 480px;
    }
  }
  .dash-constructor-schemes__data-type-0,
  .dash-constructor-schemes__data-type-2,
  .dash-constructor-schemes__data-type-3 {
    border: 1px solid var(--main_border);
    border-radius: 5px;
    padding: 15px 8px;
    margin-bottom: 24px;
  }
  .dash-constructor-schemes__slider {
    .dash-constructor-schemes__slider-title {
      width: inherit;
      display: flex;
      justify-content: space-between;
    }
  }
}

.dash-constructor-schemes__data-panel-select {
  min-width: 420px;
  max-width: 420px;
}
</style>
