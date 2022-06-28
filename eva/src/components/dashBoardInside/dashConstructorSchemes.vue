<template>
  <div
    class="dash-constructor-schemes"
    :style="{
      'width': `${innerSize.width}px`,
      'height': `${innerSize.height}px`,
    }"
  >
    <button
      class="pa-2"
      @click="toggleDnDPanel"
    >
      <v-icon
        class="control-button edit-icon theme--dark"
        :style="{ color: theme.$secondary_text }"
      >
        {{ gear }}
      </v-icon>
    </button>
    <button
      v-if="dataSelectedNode"
      class="pa-2"
      @click="orderToFront"
    >
      <v-icon
        class="control-button edit-icon theme--dark"
        :style="{ color: theme.$secondary_text }"
      >
        {{ arrowUp }}
      </v-icon>
    </button>
    <button
      v-if="dataSelectedNode"
      class="pa-2"
      @click="orderToBack"
    >
      <v-icon
        class="control-button edit-icon theme--dark"
        :style="{ color: theme.$secondary_text }"
      >
        {{ arrowDown }}
      </v-icon>
    </button>
    <!--Drag-and-drop panel-->
    <div
      ref="dndPanelContainer"
      class="dash-constructor-schemes__dnd-panel-container"
      :class="{
        'dash-constructor-schemes__dnd-panel-container--active': dndPanel,
      }"
    >
      <div class="row justify-end">
        <div class="col-auto">
          <button
            @click="toggleDnDPanel"
          >
            <v-icon
              class="control-button edit-icon theme--dark"
              :style="{ color: theme.$secondary_text }"
            >
              {{ closeIcon }}
            </v-icon>
          </button>
        </div>
      </div>
      <div
        ref="dndPanel"
        class="dash-constructor-schemes__dnd-panel"
      >
        <v-expansion-panels
          accordion
        >
          <v-expansion-panel>
            <v-expansion-panel-header
              class="dndPanelItem__group-title"
            >
              Стандартные элементы
            </v-expansion-panel-header>
            <v-expansion-panel-content eager>
              <div class="dndPanelItem__group dndPanelItem__group--default-element">
                <v-expansion-panels>
                  <v-expansion-panel>
                    <v-expansion-panel-header>
                      Настройки:
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <div
                        class="dash-constructor-schemes__options"
                      >
                        <div class="row">
                          <div class="col-12">
                            Настройки линии
                          </div>
                          <!--Цвет линии-->
                          <div class="col-8">
                            Цвет:
                          </div>
                          <div class="col-4">
                            <v-menu
                              top
                              offset-x
                              :close-on-content-click="false"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  :style="{
                                    'background-color': edgeCustomStyles.strokeColor,
                                  }"
                                  dark
                                  v-bind="attrs"
                                  v-on="on"
                                />
                              </template>

                              <v-color-picker
                                v-model="edgeCustomStyles.strokeColor"
                                dot-size="12"
                                mode="rgba"
                                @input="closeEdgeColorPicker"
                              />
                            </v-menu>
                          </div>
                          <!--Размер линии-->
                          <div class="col-8">
                            Размер:
                          </div>
                          <div class="col-4">
                            <v-text-field
                              v-model="edgeCustomStyles.strokeSize"
                              dense
                            />
                          </div>
                          <!--Скругление линии-->
                          <div class="col-8">
                            Скругление:
                          </div>
                          <div class="col-4">
                            <v-text-field
                              v-model.number="edgeCustomStyles.smoothingLength"
                              dense
                              placeholder="Скругление"
                            />
                          </div>
                          <div class="col-12">
                            Настройки блока
                          </div>
                          <!--Цвет блока-->
                          <div class="col-8">
                            Цвет фона:
                          </div>
                          <div class="col-4">
                            <v-menu
                              top
                              offset-x
                              :close-on-content-click="false"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  :style="{
                                    'background-color': nodeCustomStyles.fill,
                                  }"
                                  dark
                                  v-bind="attrs"
                                  v-on="on"
                                />
                              </template>

                              <v-color-picker
                                v-model="nodeCustomStyles.fill"
                                dot-size="12"
                                mode="rgba"
                                @input="closeEdgeColorPicker"
                              />
                            </v-menu>
                          </div>
                          <!--Цвет рамки блока-->
                          <div class="col-8">
                            Цвет рамки:
                          </div>
                          <div class="col-4">
                            <v-menu
                              top
                              offset-x
                              :close-on-content-click="false"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  :style="{
                                    'background-color': nodeCustomStyles.strokeColor,
                                  }"
                                  dark
                                  v-bind="attrs"
                                  v-on="on"
                                />
                              </template>

                              <v-color-picker
                                v-model="nodeCustomStyles.strokeColor"
                                dot-size="12"
                                mode="rgba"
                                @input="closeEdgeColorPicker"
                              />
                            </v-menu>
                          </div>
                          <!--Размер рамки блока-->
                          <div class="col-8">
                            Размер рамки:
                          </div>
                          <div class="col-4">
                            <v-text-field
                              v-model="nodeCustomStyles.strokeSize"
                              dense
                            />
                          </div>
                        </div>
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
                <div class="dndPanelItem__group-items" />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header
              class="dndPanelItem__group-title"
            >
              Блоки с данными
            </v-expansion-panel-header>
            <v-expansion-panel-content eager>
              <div class="dndPanelItem__group dndPanelItem__group--data-node">
                <div class="dndPanelItem__group-items" />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header
              class="dndPanelItem__group-title"
            >
              Текстовые блоки
            </v-expansion-panel-header>
            <v-expansion-panel-content eager>
              <div class="dndPanelItem__group dndPanelItem__group--text-node">
                <div class="dndPanelItem__group-items" />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header
              class="dndPanelItem__group-title"
            >
              Изображения\иконки
            </v-expansion-panel-header>
            <v-expansion-panel-content eager>
              <div class="dndPanelItem__group dndPanelItem__group--image-node">
                <div class="dndPanelItem__group-items" />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-header class="dndPanelItem__group-title">
              Подписи к блокам
            </v-expansion-panel-header>
            <v-expansion-panel-content eager>
              <div class="dndPanelItem__group dndPanelItem__group--label-node">
                <div class="dndPanelItem__group-items" />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
    </div>
    <div
      class="dash-constructor-schemes__data-panel"
      :class="{
        'dash-constructor-schemes__data-panel--active': dataPanel,
      }"
    >
      <div class="row">
        <div class="col-12">
          <button @click="closeDataPanel">
            <v-icon
              class="control-button edit-icon theme--dark"
              :style="{ color: theme.$secondary_text }"
            >
              {{ closeIcon }}
            </v-icon>
          </button>
        </div>
      </div>
      <div
        v-if="dataSelectedNode"
        ref="dataPanelItems"
        class="dash-constructor-schemes__data-panel-wrapper"
      >
        <div
          v-if="
            dataSelectedNode.dataType === '0'
              || dataSelectedNode.dataType === '1'
          "
          class="dash-constructor-schemes__data-panel-item"
        >
          <div
            v-for="(item, index) in dataSelectedNode.items"
            :key="`${dataSelectedNode.nodeId}-${index}`"
            class="row align-center"
          >
            <v-select
              v-model="item.id"
              :items="mockData"
              item-value="TagName"
              item-text="Description"
              label="Данные для строки"
              :menu-props="{
                'z-index': 100,
              }"
              class="col-10"
              @change="changeDataSelectedNode"
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
        </div>
        <div
          v-if="
            dataSelectedNode.dataType === '2'
              || dataSelectedNode.dataType === '3'
          "
          class="dash-constructor-schemes__data-panel-item"
        >
          <v-select
            v-model="dataSelectedNode.id"
            :items="mockData"
            item-value="TagName"
            item-text="Description"
            label="Данные для строки"
            :menu-props="{
              'z-index': 100,
            }"
            @change="changeDataSelectedNode"
          />
        </div>
        <div
          v-if=" dataSelectedNode.dataType === '4' "
          class="dash-constructor-schemes__data-panel-item"
        >
          <v-select
            v-model="dataSelectedNode.id"
            :items="mockData"
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
                      'background-color': dataSelectedNode.currentValueColor,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  v-model="dataSelectedNode.currentValueColor"
                  dot-size="12"
                  mode="rgba"
                  @input="closeEdgeColorPicker"
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
                      'background-color': dataSelectedNode.maxValueColor,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  v-model="dataSelectedNode.maxValueColor"
                  dot-size="12"
                  mode="rgba"
                  @input="closeEdgeColorPicker"
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
                      'background-color': dataSelectedNode.textColor,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  v-model="dataSelectedNode.textColor"
                  dot-size="12"
                  mode="rgba"
                  @input="closeEdgeColorPicker"
                />
              </v-menu>
            </div>
          </div>
          <v-btn
            small
            :color="theme.$primary_button"
            @click="changeDataSelectedNode"
          >
            Применить
          </v-btn>
        </div>
        <div
          v-if="dataSelectedNode.dataType === '5'"
          class="dash-constructor-schemes__data-panel-item"
        >
          <v-select
            v-model="dataSelectedNode.idFirst"
            :items="mockData"
            item-value="TagName"
            item-text="Description"
            label="Первое значение"
            :menu-props="{
              'z-index': 100,
            }"
          />
          <div class="row">
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
                      'background-color': dataSelectedNode.firstValueColor,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  v-model="dataSelectedNode.firstValueColor"
                  dot-size="12"
                  mode="rgba"
                  @input="closeEdgeColorPicker"
                />
              </v-menu>
            </div>
          </div>
          <div class="row">
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
                      'background-color': dataSelectedNode.firstTextColor,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  v-model="dataSelectedNode.firstTextColor"
                  dot-size="12"
                  mode="rgba"
                  @input="closeEdgeColorPicker"
                />
              </v-menu>
            </div>
          </div>
          <v-select
            v-model="dataSelectedNode.idSecond"
            :items="mockData"
            item-value="TagName"
            item-text="Description"
            label="Второе значение"
            :menu-props="{
              'z-index': 100,
            }"
          />
          <div class="row">
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
                      'background-color': dataSelectedNode.secondValueColor,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  v-model="dataSelectedNode.secondValueColor"
                  dot-size="12"
                  mode="rgba"
                  @input="closeEdgeColorPicker"
                />
              </v-menu>
            </div>
          </div>
          <div class="row">
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
                      'background-color': dataSelectedNode.secondTextColor,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  v-model="dataSelectedNode.secondTextColor"
                  dot-size="12"
                  mode="rgba"
                  @input="closeEdgeColorPicker"
                />
              </v-menu>
            </div>
          </div>
          <v-btn
            small
            :color="theme.$primary_button"
            @click="changeDataSelectedNode"
          >
            Применить
          </v-btn>
        </div>
        <div
          v-if="dataSelectedNode.dataType === 'label-0'"
          class="dash-constructor-schemes__data-panel-item"
        >
          <v-text-field
            v-model="dataSelectedNode.text"
            label="Текст"
            :color="theme.$main_text"
            style="margin-bottom: 10px"
            outlined
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
                      'background-color': dataSelectedNode.textColor,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  v-model="dataSelectedNode.textColor"
                  dot-size="12"
                  mode="rgba"
                  @input="closeEdgeColorPicker"
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
                      'background-color': dataSelectedNode.bgColor,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  v-model="dataSelectedNode.bgColor"
                  dot-size="12"
                  mode="rgba"
                  @input="closeEdgeColorPicker"
                />
              </v-menu>
            </div>
            <div class="col-8">
              Вертикальное расположение
            </div>
            <div class="col-4">
              <v-switch
                v-model="dataSelectedNode.isVertical"
              />
            </div>
            <div class="col-8">
              Отображение бордера
            </div>
            <div class="col-4">
              <v-switch
                v-model="dataSelectedNode.bordered"
              />
            </div>
          </div>
          <div
            v-if="dataSelectedNode.bordered"
            class="row align-center"
          >
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
                      'background-color': dataSelectedNode.borderColor,
                    }"
                    dark
                    v-bind="attrs"
                    v-on="on"
                  />
                </template>

                <v-color-picker
                  v-model="dataSelectedNode.borderColor"
                  dot-size="12"
                  mode="rgba"
                  @input="closeEdgeColorPicker"
                />
              </v-menu>
            </div>
            <div class="col-8">
              Пунктирный бордер
            </div>
            <div class="col-4">
              <v-switch
                v-model="dataSelectedNode.borderDashed"
              />
            </div>
            <div class="col-12">
              <v-text-field
                v-model="dataSelectedNode.borderSize"
                label="Размер бордера"
                :color="theme.$main_text"
                outlined
                hide-details
                style="margin-bottom: 10px"
              />
            </div>
          </div>
          <v-btn
            small
            :color="theme.$primary_button"
            @click="changeDataSelectedNode"
          >
            Применить
          </v-btn>
        </div>
      </div>
    </div>
    <!--The GraphComponent-->
    <div
      ref="graphComponent"
      class="dash-constructor-schemes__graph-component"
    />
  </div>
</template>

<script>
import {
  mdiSettings, mdiClose, mdiArrowUp, mdiArrowDown,
} from '@mdi/js';
import ConstructorSchemesClass from '../../js/classes/ConstructorSchemes/ConstructorSchemesClass';

export default {
  name: 'DashConstructorSchemes',
  props: {
    // id элемента (table-1\2\3, graph-1\2\3)
    idFrom: {
      type: String,
      required: true,
    },
    // id дашборда
    idDashFrom: {
      type: String,
      required: true,
    },
    // данные с сервера
    dataRestFrom: {
      type: Array,
      default: () => ([]),
    },
    // размеры визуализации(width, height)
    sizeFrom: {
      type: Object,
      required: true,
    },
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      gear: mdiSettings,
      closeIcon: mdiClose,
      arrowUp: mdiArrowUp,
      arrowDown: mdiArrowDown,
      dndPanel: false,
      dataPanel: false,
      edgeColorPopup: false,
      nodeBgColorPopup: false,
      nodeBorderColorPopup: false,
      edgeCustomStyles: {
        strokeSize: '10.5px',
        smoothingLength: 0,
        strokeColor: '#FFFFFF',
        targetArrowColor: '#F4F4F4',
      },
      nodeCustomStyles: {
        fill: '#ee0000',
        strokeColor: '#EE0000FF',
        strokeSize: '1.5px',
      },
      labelCustomStyles: {
        font: '12px Tahoma',
        textFill: '#000000',
      },
      // Список иконок для схемы
      iconsList: [
        {
          src: '/icons/icon-test-1.svg',
          width: 459,
          height: 274,
          label: 'ГС (Газосепаратор)',
        },
        {
          src: '/icons/icon-test-2.svg',
          width: 380,
          height: 331,
          label: 'ДЕ (Дренажная емкость)',
        },
        {
          src: '/icons/icon-test-3.svg',
          width: 378,
          height: 466,
          label: 'Дизельная электростанция',
        },
        {
          src: '/icons/icon-test-4.svg',
          width: 395,
          height: 492,
          label: 'Клапан регулятор',
        },
        {
          src: '/icons/icon-test-5.svg',
          width: 424,
          height: 473,
          label: 'НВО (Насосная внешней откачки)',
        },
        {
          src: '/icons/icon-test-6.svg',
          width: 523,
          height: 296,
          label: 'НГС (Нефтегазосепаратор)',
        },
        {
          src: '/icons/icon-test-7.svg',
          width: 560,
          height: 211,
          label: 'ОВ (Отстойник водяной)',
        },
        {
          src: '/icons/icon-test-8.svg',
          width: 556,
          height: 224,
          label: 'П (Печь OFF)',
        },
        {
          src: '/icons/icon-test-9.svg',
          width: 600,
          height: 238,
          label: 'П (Печь ON)',
        },
        {
          src: '/icons/icon-test-10.svg',
          width: 310,
          height: 431,
          label: 'РВС (Резервуар вертикальный стальной)',
        },
        {
          src: '/icons/icon-test-11.svg',
          width: 138,
          height: 372,
          label: 'Соединение №1',
        },
        {
          src: '/icons/icon-test-12.svg',
          width: 117,
          height: 530,
          label: 'Соединение №2(1)',
        },
        {
          src: '/icons/icon-test-13.svg',
          width: 116,
          height: 530,
          label: 'Соединение №2(2)',
        },
        {
          src: '/icons/icon-test-14.svg',
          width: 490,
          height: 463,
          label: 'Соединение №3(1)',
        },
        {
          src: '/icons/icon-test-15.svg',
          width: 464,
          height: 488,
          label: 'Соединение №3(2)',
        },
        {
          src: '/icons/icon-test-15.svg',
          width: 490,
          height: 461,
          label: 'Соединение №3(3)',
        },
        {
          src: '/icons/icon-test-16.svg',
          width: 459,
          height: 488,
          label: 'Соединение №3(4)',
        },
        {
          src: '/icons/icon-test-17.svg',
          width: 313,
          height: 524,
          label: 'ФВД и ФНД (Факел высокого давления) и (Факел низкого давления)',
        },
        {
          src: '/icons/icon-test-18.svg',
          width: 352,
          height: 471,
          label: 'Электроприводная задвижка',
        },
        // Слишком много весят иконки
        // {
        //   src: '/icons/icon-test-19.svg',
        //   width: 633,
        //   height: 475,
        //   label: 'Баки 1',
        // },
        // {
        //   src: '/icons/icon-test-20.svg',
        //   width: 633,
        //   height: 475,
        //   label: 'Вентель зеленый 2',
        // },
        // {
        //   src: '/icons/icon-test-21.svg',
        //   width: 633,
        //   height: 475,
        //   label: 'Манометр 1',
        // },
        // {
        //   src: '/icons/icon-test-22.svg',
        //   width: 633,
        //   height: 475,
        //   label: 'Вентель красный 2',
        // },
        // {
        //   src: '/icons/icon-test-23.svg',
        //   width: 633,
        //   height: 475,
        //   label: 'Насос 1 1',
        // },
      ],
      testData: [
        {
          id: '',
        },
      ],
      allItems: [],
      mockData: [
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_NGS1_PNI',
          Description: 'НГС-1 Давление',
          value: '6.793125152587891',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_NGS1_LNI',
          Description: 'НГС-1 Уровень',
          value: '0.8172000050544739',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_NGS2_PNI',
          Description: 'НГС-2 Давление',
          value: '',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_NGS2_LNI',
          Description: 'НГС-2 Уровень',
          value: '',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'TAYL-D1_NGS3_PNI',
          Description: 'НГС-3 Давление',
          value: '6.817500114440918',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'TAYL-D1_NGS3_TNI',
          Description: 'НГС-3 Температура',
          value: '37.959373474121094',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'TAYL-D1_NGS3_LNI',
          Description: 'НГС-3 Уровень',
          value: '0.8356599807739258',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove1_In_PNI',
          Description: 'П-1 Давление на входе',
          value: '5.357499599456787',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove1_Out_PNI',
          Description: 'П-1 Давление на выходе',
          value: '4.078125',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove1_In_TNI',
          Description: 'П-1 Температура на входе',
          value: '45.390625',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove1_Out_TNI',
          Description: 'П-1 Температура на выходе',
          value: '58.412498474121094',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove2_In_PNI',
          Description: 'П-2 Давление на входе',
          value: '5.059375286102295',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove2_Out_PNI',
          Description: 'П-2 Давление на выходе',
          value: '4.093124866485596',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove2_In_TNI',
          Description: 'П-2 Температура на входе',
          value: '43.56249237060547',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove2_Out_TNI',
          Description: 'П-2 Температура на выходе',
          value: '54.36000061035156',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove3_In_PNI',
          Description: 'П-3 Давление на входе',
          value: '4.653749942779541',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove3_Out_PNI',
          Description: 'П-3 Давление на выходе',
          value: '4.324999809265137',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove4_In_PNI',
          Description: 'П-4 Давление на входе',
          value: '4.473750114440918',
        },
        {
          NameObject: 'Тайлаковское м/р ДНС-1',
          TagName: 'S1D1_Stove4_Out_PNI',
          Description: 'П-4 Давление на выходе',
          value: '4.23562479019165',
        },
      ],
      selectedNode: '',
      selectedDataType: '',
      dataSelectedNode: null,
    };
  },
  computed: {
    dashFromStore() {
      return this.$store.state[this.idDashFrom];
    },
    savedGraph() {
      return this.dashFromStore.savedGraph || '';
    },
    innerSize() {
      return {
        height: this.sizeFrom.height - 32,
        width: this.sizeFrom.width,
      };
    },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    // TODO: Написать метод для перерисовки отдельного элемента на DnD панели
    edgeCustomStyles: {
      deep: true,
      handler(/* value */) {
        if (this.constructorSchemes) {
          // this.constructorSchemes.applyStylesElements({
          //   edgeCustomStyles: value,
          // });
        }
      },
    },
    nodeCustomStyles: {
      deep: true,
      handler(/* value */) {
        if (this.constructorSchemes) {
          // this.constructorSchemes.applyStylesElements({
          //   nodeCustomStyles: value,
          // });
        }
      },
    },
    labelCustomStyles: {
      deep: true,
      handler(/* value */) {
        if (this.constructorSchemes) {
          // this.constructorSchemes.applyStylesElements({
          //   labelCustomStyles: value,
          // });
        }
      },
    },
    mockData: {
      deep: true,
      handler(value) {
        if (this.constructorSchemes) {
          this.constructorSchemes.updateDataInNode(value);
        }
      },
    },
  },
  mounted() {
    this.createGraph();
    setTimeout(() => {
      this.testUpdate();
    }, 2000);
  },
  methods: {
    testUpdate() {
      this.mockData[0].value = '333';
    },
    closeEdgeColorPicker() {
      this.edgeColorPopup = false;
    },
    toggleDnDPanel() {
      this.dndPanel = !this.dndPanel;
    },
    createGraph() {
      this.constructorSchemes = new ConstructorSchemesClass({
        dndPanelElem: this.$refs.dndPanel,
        elem: this.$refs.graphComponent,
        dataRest: this.mockData,
        iconsList: this.iconsList,
        edgeCustomStyles: this.edgeCustomStyles,
        nodeCustomStyles: this.nodeCustomStyles,
        labelCustomStyles: this.labelCustomStyles,
        openDataPanelCallback: this.openDataPanel,
        closeDataPanelCallback: this.closeDataPanel,
        savedGraph: this.savedGraph,
        updateStoreCallback: this.updateSavedGraph,
      });
    },

    changeDataSelectedNode() {
      this.constructorSchemes.updateSelectedNode(
        this.dataSelectedNode,
        this.updateSavedGraph,
      );
    },

    updateSavedGraph(data) {
      this.$store.commit('setState', [{
        object: this.dashFromStore,
        prop: 'savedGraph',
        value: data,
      }]);
    },
    closeDataPanel() {
      this.dataPanel = false;
      this.selectedNode = '';
      this.selectedDataType = '';
      this.dataSelectedNode = null;
    },
    openDataPanel(targetElement) {
      this.closeDataPanel();
      this.dataPanel = true;
      this.selectedNode = structuredClone(targetElement.nodeId);
      this.selectedDataType = structuredClone(targetElement.dataType);
      this.dataSelectedNode = structuredClone(targetElement);
    },
    orderToFront() {
      this.constructorSchemes.orderToFront();
    },
    orderToBack() {
      this.constructorSchemes.orderToBack();
    },
    addLine() {
      this.dataSelectedNode.items.push({
        id: '',
        textLeft: 'Label',
        textRight: 'Value',
      });
      this.changeDataSelectedNode();
    },
    deleteLine(index) {
      this.dataSelectedNode.items.splice(index, 1);
      this.changeDataSelectedNode();
    },
  },
};
</script>

<style lang="scss" scoped>
.dash-constructor-schemes {
  position: relative;
  &__color-button {
    width: 100%;
    height: 30px;
  }
  &__relative-wrapper {
    position: relative;
  }
  &__color-picker {
    position: absolute;
    pointer-events: none;
    opacity: 0;
    width: 230px;
    &--active {
      z-index: 1;
      opacity: 1;
      pointer-events: all;
      left: -170px;
    }
  }
  &__dnd-panel-container, &__data-panel {
    color: var(--main_text);
    z-index: 1;
    position: absolute;
    top: 5px;
    bottom: 15px;
    background-color: var(--main_bg);
    width: 250px;
    padding: 10px;
    border-top: 2px solid var(--secondary_bg);
    border-bottom: 2px solid var(--secondary_bg);
    transition: all .2s ease;
    pointer-events: none;
    max-height: inherit;
    overflow-y: auto;
    overflow-x: hidden;
  }
  &__dnd-panel-container {
    left: 0;
    border-right: 2px solid var(--secondary_bg);
    border-radius: 0 4px 4px 0;
    transform: translateX(-100%);
    &--active {
      transform: translateX(0);
      pointer-events: all;
    }
  }
  &__data-panel {
    right: 0;
    width: 300px;
    transform: translateX(100%);
    border-left: 2px solid var(--secondary_bg);
    border-radius: 4px 0 0 4px;
    &--active {
      transform: translateX(0);
      pointer-events: all;
    }
    &-wrapper {
      padding-top: 10px;
    }
  }
  &__graph-component {
    //height: inherit;
    height: calc(100% - 42px);
  }
  &__dnd-panel ::v-deep {
    .v-expansion-panel {
      background-color: var(--main_bg);
      color: var(--main_text);
      &::before {
        box-shadow: none;
      }
    }
    .v-expansion-panel-content__wrap {
      padding-left: 0;
      padding-right: 0;
    }
    .v-expansion-panel-header {
      padding-left: 0;
      padding-right: 0;
    }
    .v-expansion-panels {
      .v-expansion-panel-header__icon  {
        .v-icon {
          color: var(--main_text);
        }
      }
    }

  }
}
</style>

<style lang="scss">
.b-data-node {
  &__text {
    font-weight: 700;
    font-size: 11px;
    line-height: 1;
  }
  &__wrapper {
    &--type-2 {
      display: flex;
      height: 100%;
      text-align: center;
      font-weight: 700;
      font-size: 11px;
      line-height: 13px;
      color: #FFFFFF;
      box-sizing: border-box;
      justify-content: center;
      align-items: center;
      padding: 7.5px 12px;
    }
  }
}
</style>
