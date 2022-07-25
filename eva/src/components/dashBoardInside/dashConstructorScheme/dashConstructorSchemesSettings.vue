<template>
  <div
    v-if="dataObject"
    ref="dataPanelItems"
    class="dash-constructor-schemes__data-panel-wrapper"
  >
    <div class="dash-constructor-schemes__data-panel-item">
      <template v-if="dataType === '0' || dataType === '1'">
        <div
          v-for="(item, index) in dataObject.items"
          :key="`${dataObject.nodeId}-${index}`"
          class="row align-center"
        >
          <v-select
            v-model="item.id"
            :items="dataRestFrom"
            item-value="TagName"
            item-text="Description"
            label="Данные для строки"
            :menu-props="{
              'z-index': 100,
            }"
            class="col-10"
            @change="updateModelValue(dataObject)"
          />
          <v-icon
            class="control-button edit-icon theme--dark col-2"
            :style="{ color: theme.$secondary_text }"
            @click="deleteLine(index)"
          >
            {{ closeIcon }}
          </v-icon>
        </div>
        <v-btn
          small
          :color="theme.$primary_button"
          @click="addLine()"
        >
          Добавить строку
        </v-btn>
      </template>
      <template v-if="dataType === '2' || dataType === '3'">
        <v-select
          v-model="dataObject.id"
          :items="dataRestFrom"
          item-value="TagName"
          item-text="Description"
          label="Данные для строки"
          :menu-props="{
            'z-index': 100,
          }"
          @change="updateModelValue(dataObject)"
        />
      </template>
      <template v-if=" dataType === '4'">
        <v-select
          v-model="dataObject.id"
          :items="dataRestFrom"
          item-value="TagName"
          item-text="Description"
          label="Данные для строки"
          :menu-props="{
            'z-index': 100,
          }"
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
          :color="theme.$primary_button"
          @click="updateModelValue(dataObject)"
        >
          Применить
        </v-btn>
      </template>
      <template v-if="dataType === '5'">
        <div class="row align-center">
          <div class="col-12">
            <v-select
              v-model="dataObject.idFirst"
              :items="dataRestFrom"
              item-value="TagName"
              item-text="Description"
              label="Первое значение"
              :menu-props="{
                'z-index': 100,
              }"
            />
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
            <v-select
              v-model="dataObject.idSecond"
              :items="dataRestFrom"
              item-value="TagName"
              item-text="Description"
              label="Второе значение"
              :menu-props="{
                'z-index': 100,
              }"
            />
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
      <template v-if="dataType === 'label-0'">
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
                    'background-color': dataObject.bgColor,
                  }"
                  dark
                  v-bind="attrs"
                  v-on="on"
                />
              </template>

              <v-color-picker
                v-model="dataObject.bgColor"
                dot-size="12"
                mode="rgba"
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
                      'background-color': dataObject.borderColor,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  v-model="dataObject.borderColor"
                  dot-size="12"
                  mode="rgba"
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
        </div>
        <v-btn
          small
          :color="theme.$primary_button"
          @click="updateModelValue(dataObject)"
        >
          Применить
        </v-btn>
      </template>
      <template v-if="dataType === 'default-node'">
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
            <v-select
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
    </div>
  </div>
</template>

<script>
import { mdiClose } from '@mdi/js';
import { throttle } from '@/js/utils/throttle';

export default {
  name: 'DashConstructorSchemesSettings',
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
  },
  methods: {
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
      this.updateModelValue(this.dataObject);
    },
    addLine() {
      this.dataObject.items.push({
        id: '',
        textLeft: 'Label',
        textRight: 'Value',
      });
      this.updateModelValue(this.dataObject);
    },
    updateModelValue() {
      this.$emit('changeDataSelectedNode', this.dataObject);
      this.$emit('update:modelValue', this.dataObject);
    },
  },
};
</script>
