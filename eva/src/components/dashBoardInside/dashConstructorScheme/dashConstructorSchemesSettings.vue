<template>
  <div
    v-if="dataObject"
    ref="dataPanelItems"
    class="dash-constructor-schemes__data-panel-wrapper"
  >
    <div class="dash-constructor-schemes__data-panel-item pb-4">
      <template v-if="dataType === 'data-type-0'">
        <!--data-type-0-->
        <div
          v-for="(element, index) in dataObject.items"
          :key="`${dataObject.nodeId}-${index}`"
          class="column"
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
              :menu-props="{
                'z-index': 100,
              }"
              class="col-10"
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
              class="control-button edit-icon theme--dark col-2"
              :style="{ color: theme.$secondary_text }"
              @click="deleteLine(index)"
            >
              {{ closeIcon }}
            </v-icon>
          </div>
          <div
            class="mr-10"
            :style="{ color: theme.$secondary_text }"
          >
            {{ element.id | getObjectNameById(dataRestFrom) }}
          </div>
          <v-text-field
            v-model="element.description"
            label="Подпись"
            :color="theme.$accent_ui_color"
            :style="{ color: theme.$main_text }"
            class="mb-9 mr-10"
          />
        </div>
        <div class="d-flex mb-9">
          <v-btn
            class="mr-4"
            ripple
            small
            :color="theme.$primary_button"
            @click="addLine()"
          >
            <v-icon
              class="control-button edit-icon theme--dark"
              :style="{ color: theme.$secondary_text }"
            >
              {{ addLineIcon }}
            </v-icon>
          </v-btn>
          <div>
            Добавить строку
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
          <v-autocomplete
            v-model="dataObject.id"
            :items="dataRestFrom"
            item-value="TagName"
            item-text="Description"
            label="Данные для строки"
            :filter="tagNameAutocompleteFilter"
            :menu-props="{
              'z-index': 100,
            }"
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
            class="mr-10"
            :style="{ color: theme.$secondary_text }"
          >
            {{ dataObject.id | getObjectNameById(dataRestFrom) }}
          </div>
          <v-text-field
            v-model="dataObject.description"
            label="Подпись"
            :color="theme.$accent_ui_color"
            :style="{ color: theme.$main_text }"
            class="mb-9 mr-10"
          />
          <v-btn
            small
            :color="theme.$primary_button"
            :style="{ color: theme.$main_text }"
            @click="updateModelValue"
          >
            Применить
          </v-btn>
        </div>
      </template>
      <template v-if=" dataType === 'data-type-2'">
        <!--data-type-2-->
        <div class="column">
          <v-autocomplete
            v-model="dataObject.id"
            :items="dataRestFrom"
            item-value="TagName"
            item-text="Description"
            label="Данные для строки"
            :menu-props="{
              'z-index': 100,
            }"
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
            class="mb-9"
            :style="{ color: theme.$secondary_text }"
          >
            {{ dataObject.id | getObjectNameById(dataRestFrom) }}
          </div>
        </div>
        <v-text-field
          v-model.number="dataObject.maxValue"
          :rules="[value => value >= 0 || 'Некорректное значение.']"
          label="Максимальное значение*"
        />
        <div class="row">
          <div class="col-8">
            Цвет текущего
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
                    'background-color': dataObject.currentValueColor,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.currentValueColor"
                dot-size="12"
                mode="rgba"
              />
            </v-menu>
          </div>
          <div class="col-8">
            Цвет максимального
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
                    'background-color': dataObject.maxValueColor,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.maxValueColor"
                dot-size="12"
                mode="rgba"
              />
            </v-menu>
          </div>
          <div class="col-8">
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
                    'background-color': dataObject.textColor,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.textColor"
                dot-size="12"
                mode="rgba"
              />
            </v-menu>
          </div>
        </div>
        <v-btn
          small
          :disabled="!(dataObject.maxValue >= 0)"
          :color="theme.$primary_button"
          @click="updateModelValue(dataObject)"
        >
          Применить
        </v-btn>
      </template>
      <template v-if="dataType === 'data-type-3'">
        <!--data-type-3-->
        <div class="row align-center">
          <div class="col-12">
            <div class="column">
              <v-autocomplete
                v-model="dataObject.idFirst"
                :items="dataRestFrom"
                item-value="TagName"
                item-text="Description"
                label="Первое значение"
                :menu-props="{
                  'z-index': 100,
                }"
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
                class="mb-9"
                :style="{ color: theme.$secondary_text }"
              >
                {{ dataObject.idFirst | getObjectNameById(dataRestFrom) }}
              </div>
            </div>
          </div>
          <div class="col-8">
            Цвет первого значения
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
                    'background-color': dataObject.firstValueColor,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.firstValueColor"
                dot-size="12"
                mode="rgba"
              />
            </v-menu>
          </div>
          <div class="col-8">
            Цвет текста первого значения
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
                    'background-color': dataObject.firstTextColor,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.firstTextColor"
                dot-size="12"
                mode="rgba"
              />
            </v-menu>
          </div>
        </div>
        <div class="row align-center">
          <div class="col-12">
            <div class="column">
              <v-autocomplete
                v-model="dataObject.idSecond"
                :items="dataRestFrom"
                item-value="TagName"
                item-text="Description"
                label="Второе значение"
                :menu-props="{
                  'z-index': 100,
                }"
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
                class="mb-9"
                :style="{ color: theme.$secondary_text }"
              >
                {{ dataObject.idSecond | getObjectNameById(dataRestFrom) }}
              </div>
            </div>
          </div>
          <div class="col-8">
            Цвет второго значения
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
                    'background-color': dataObject.secondValueColor,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.secondValueColor"
                dot-size="12"
                mode="rgba"
              />
            </v-menu>
          </div>
          <div class="col-8">
            Цвет текста второго значения
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
                    'background-color': dataObject.secondTextColor,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.secondTextColor"
                dot-size="12"
                mode="rgba"
              />
            </v-menu>
          </div>
        </div>
        <v-btn
          small
          :color="theme.$primary_button"
          @click="updateModelValue(dataObject)"
        >
          Применить
        </v-btn>
      </template>
      <template v-if="dataType === 'label-type-0'">
        <!--label-type-0-->
        <div class="row align-center">
          <div class="col-12">
            <v-text-field
              v-model="dataObject.text"
              label="Текст"
              :color="theme.$main_text"
              style="margin-bottom: 10px"
              outlined
              hide-details
            />
          </div>
          <div class="col-8">
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
                    'background-color': dataObject.textColor,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.textColor"
                dot-size="12"
                mode="rgba"
              />
            </v-menu>
          </div>
          <div class="col-12">
            <v-text-field
              v-model="dataObject.fontSize"
              label="Размер текста"
              :color="theme.$main_text"
              outlined
              hide-details
              style="margin-bottom: 10px"
            />
          </div>
          <div class="col-8">
            Цвет заливки
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
            Вертикальное расположение
          </div>
          <div class="col-4">
            <v-switch
              v-model="dataObject.isVertical"
            />
          </div>
          <div class="col-8">
            Отображение бордера
          </div>
          <div class="col-4">
            <v-switch
              v-model="dataObject.bordered"
            />
          </div>
          <template v-if="dataObject.bordered">
            <div class="col-8">
              Цвет бордера
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
              Пунктирный бордер
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
        <div class="row align-center">
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
              :menu-props="{
                'z-index': 100,
              }"
            />
          </div>
        </div>
        <v-btn
          small
          :color="theme.$primary_button"
          @click="updateModelValue(dataObject)"
        >
          Применить
        </v-btn>
      </template>
      <template v-if="dataType === 'edge'">
        <div class="row">
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
          :color="theme.$primary_button"
          @click="updateModelValue(dataObject)"
        >
          Применить
        </v-btn>
      </template>
      <template v-if="dataType === 'label'">
        <v-text-field
          v-model="dataObject.fontSize"
          label="Размер текста"
          :color="theme.$main_text"
          style="margin-bottom: 10px"
          outlined
          type="Number"
          hide-details
        />
        <div class="row align-center">
          <div class="col-8">
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
                    'background-color': dataObject.color.rgbaString,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.color.rgbaObject"
                dot-size="12"
                mode="rgba"
                @update:color="updateSelectedNodeColor($event, 'color')"
              />
            </v-menu>
          </div>
        </div>
        <v-btn
          small
          :color="theme.$primary_button"
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
    updateSelectedNodeColor(evt, field) {
      const updateValue = structuredClone(this.dataObject);
      updateValue[field] = {
        rgbaObject: evt.rgba,
        rgbaString: `rgba(${evt.rgba.r}, ${evt.rgba.g}, ${evt.rgba.b}, ${evt.rgba.a})`,
      };
      this.dataObject = updateValue;
    },
    deleteLine(index) {
      this.dataObject.items.splice(index, 1);
    },
    addLine() {
      this.dataObject.items.push({
        id: '',
        textLeft: 'Label',
        textRight: 'Value',
      });
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
