<template>
  <div
    class="dash-constructor-schemes"
    :style="{
      'width': `${innerSize.width - 22}px`,
      'height': `${innerSize.height}px`,
      background: theme.$secondary_bg,
      margin: '0 10px',
    }"
  >
    <div
      class="dash-constructor-schemes__options"
      :class="{
        'dash-constructor-schemes__options--is-keymap-open': isKeymapOpen,
      }"
    >
      <v-tooltip
        bottom
        :color="theme.$accent_ui_color"
      >
        <template v-slot:activator="{ on }">
          <div v-on="on">
            <v-switch
              v-model="isEdit"
              inset
              dense
              label=""
              @change="toggleInputMode"
            />
          </div>
        </template>
        <span>Вкл\выкл режим редактирования</span>
      </v-tooltip>
      <template v-if="isEdit">
        <v-tooltip
          bottom
          :color="theme.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <div class="pa-2 d-flex">
              <v-icon
                class="control-button edit-icon theme--dark"
                :style="{ color: theme.$secondary_text }"
                v-on="on"
                @click="toggleDnDPanel"
              >
                {{ gear }}
              </v-icon>
            </div>
          </template>
          <span>Панель настроек</span>
        </v-tooltip>
        <template v-if="dataSelectedNode">
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
          >
            <template v-slot:activator="{ on }">
              <div class="pa-2 d-flex">
                <bring-to-front
                  class="control-button edit-icon theme--dark"
                  :style="{ color: theme.$secondary_text }"
                  v-on="on"
                  @click="orderTo('toFront')"
                />
              </div>
            </template>
            <span>На передний план</span>
          </v-tooltip>
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
          >
            <template v-slot:activator="{ on }">
              <div class="pa-2 d-flex">
                <send-to-back
                  class="control-button edit-icon theme--dark"
                  :style="{ color: theme.$secondary_text }"
                  v-on="on"
                  @click="orderTo('toBack')"
                />
              </div>
            </template>
            <span>На задний план</span>
          </v-tooltip>
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
          >
            <template v-slot:activator="{ on }">
              <div class="pa-2 d-flex">
                <bring-forward
                  class="control-button edit-icon theme--dark"
                  :style="{ color: theme.$secondary_text }"
                  v-on="on"
                  @click="orderTo('raise')"
                />
              </div>
            </template>
            <span>На уровень выше</span>
          </v-tooltip>
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
          >
            <template v-slot:activator="{ on }">
              <div class="pa-2 d-flex">
                <send-backward
                  class="control-button edit-icon theme--dark"
                  :style="{ color: theme.$secondary_text }"
                  v-on="on"
                  @click="orderTo('lower')"
                />
              </div>
            </template>
            <span>На уровень ниже</span>
          </v-tooltip>
        </template>
      </template>
    </div>
    <div class="dash-constructor-schemes__keymap-button">
      <v-tooltip
        top
        :nudge-top="5"
        :color="theme.$accent_ui_color"
      >
        <template v-slot:activator="{ on }">
          <button
            v-on="on"
            @click="openKeymapPanel"
          >
            <v-icon
              class="control-button edit-icon theme--dark"
              :style="{ color: theme.$secondary_text }"
            >
              {{ iconHelp }}
            </v-icon>
          </button>
        </template>
        <span>Справка по горячим клавишам</span>
      </v-tooltip>
    </div>
    <!--Keymap-panel-->
    <dash-constructor-schemes-keymap
      ref="keymap"
      v-model="isKeymapOpen"
      @changeKeymapTab="setPanelBottomOffset"
    />
    <!--Drag-and-drop panel-->
    <div
      ref="dndPanelContainer"
      class="dash-constructor-schemes__dnd-panel-container"
      :style="{
        'bottom': `${panelBottomOffset}px`,
      }"
      :class="{
        'dash-constructor-schemes__dnd-panel-container--active': dndPanel,
        // 'dash-constructor-schemes__dnd-panel-container--is-keymap-open': isKeymapOpen
      }"
    >
      <div
        v-show="!isLoading"
        class="row justify-end"
      >
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
        v-show="!isLoading"
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
                      <div class="dash-constructor-schemes__inner-options">
                        <!--TODO: Возможно стоит вынести в отдельный компонент-->
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
                              z-index="100"
                              :close-on-content-click="false"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  :style="{
                                    // eslint-disable-next-line max-len
                                    'background-color': elementDefaultStyles.edgeStrokeColor.rgbaString,
                                  }"
                                  dark
                                  v-bind="attrs"
                                  v-on="on"
                                />
                              </template>

                              <v-color-picker
                                :value="elementDefaultStyles.edgeStrokeColor.rgbaObject"
                                dot-size="12"
                                mode="rgba"
                                @update:color="updateDefaultElementColor($event, 'edgeStrokeColor')"
                              />
                            </v-menu>
                          </div>
                          <!--Размер линии-->
                          <div class="col-8">
                            Размер:
                          </div>
                          <div class="col-4">
                            <v-text-field
                              v-model="elementDefaultStyles.edgeStrokeSize"
                              dense
                            />
                          </div>
                          <!--Скругление линии-->
                          <div class="col-8">
                            Скругление:
                          </div>
                          <div class="col-4">
                            <v-text-field
                              v-model.number="elementDefaultStyles.edgeSmoothingLength"
                              dense
                              placeholder="Скругление"
                            />
                          </div>
                          <div class="col-12">
                            Настройки блока
                          </div>
                          <!--Фигура-->
                          <div class="col-12">
                            <v-select
                              v-model="elementDefaultStyles.nodeShape"
                              :items="shapeNodeStyleList"
                              item-value="id"
                              item-text="label"
                              label="Фигура"
                              :menu-props="{
                                'z-index': 100,
                              }"
                            />
                          </div>
                          <!--Цвет блока-->
                          <div class="col-8">
                            Цвет фона:
                          </div>
                          <div class="col-4">
                            <v-menu
                              top
                              offset-x
                              z-index="100"
                              :close-on-content-click="false"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  :style="{
                                    'background-color': elementDefaultStyles.nodeFill.rgbaString,
                                  }"
                                  dark
                                  v-bind="attrs"
                                  v-on="on"
                                />
                              </template>

                              <v-color-picker
                                :value="elementDefaultStyles.nodeFill.rgbaObject"
                                dot-size="12"
                                mode="rgba"
                                @update:color="updateDefaultElementColor($event, 'nodeFill')"
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
                              z-index="100"
                              :close-on-content-click="false"
                            >
                              <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                  :style="{
                                    // eslint-disable-next-line max-len
                                    'background-color': elementDefaultStyles.nodeStrokeColor.rgbaString,
                                  }"
                                  dark
                                  v-bind="attrs"
                                  v-on="on"
                                />
                              </template>

                              <v-color-picker
                                :value="elementDefaultStyles.nodeStrokeColor.rgbaObject"
                                dot-size="12"
                                mode="rgba"
                                @update:color="updateDefaultElementColor($event, 'nodeStrokeColor')"
                              />
                            </v-menu>
                          </div>
                          <!--Размер рамки блока-->
                          <div class="col-8">
                            Размер рамки:
                          </div>
                          <div class="col-4">
                            <v-text-field
                              v-model="elementDefaultStyles.nodeStrokeSize"
                              dense
                            />
                          </div>
                          <div class="col-12">
                            <v-btn
                              small
                              :color="theme.$primary_button"
                              class="dash-constructor-schemes__apply-options"
                              @click="applyOptions"
                            >
                              Применить
                            </v-btn>
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
          <v-expansion-panel>
            <v-expansion-panel-header class="dndPanelItem__group-title">
              Порты
            </v-expansion-panel-header>
            <v-expansion-panel-content eager>
              <div class="dndPanelItem__group dndPanelItem__group--port-node">
                <div class="dndPanelItem__group-items" />
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>
      <div
        v-show="isLoading"
        class="dash-constructor-schemes__loading-circular"
      >
        <v-progress-circular
          indeterminate
          size="50"
          :color="theme.$accent_ui_color"
        />
      </div>
    </div>
    <!--Settings-element-panel-->
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
      <dash-constructor-schemes-settings
        v-model="dataSelectedNode"
        :theme="theme"
        :data-rest-from="dataRestFrom"
        :shape-node-style-list="shapeNodeStyleList"
        @changeDataSelectedNode="changeDataSelectedNode"
      />
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
  mdiArrowDown, mdiArrowUp, mdiClose, mdiSettings, mdiHelp,
} from '@mdi/js';
import BringForward from '../../../images/bring_forward.svg';
import BringToFront from '../../../images/bring_to_front.svg';
import SendBackward from '../../../images/send_backward.svg';
import SendToBack from '../../../images/send_to_back.svg';

import ConstructorSchemesClass from '../../../js/classes/ConstructorSchemes/ConstructorSchemesClass';
import { throttle } from '@/js/utils/throttle';

export default {
  name: 'DashConstructorSchemes',
  components: {
    BringForward,
    BringToFront,
    SendBackward,
    SendToBack,
  },
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
      isEdit: false,
      gear: mdiSettings,
      closeIcon: mdiClose,
      arrowUp: mdiArrowUp,
      iconArrowUp: '/icons/OrderIcons/bring_to_front.svg',
      arrowDown: mdiArrowDown,
      iconHelp: mdiHelp,
      dndPanel: false,
      dataPanel: false,
      nodeBgColorPopup: false,
      nodeBorderColorPopup: false,
      shapeNodeStyle: '',
      shapeNodeStyleList: [],
      elementDefaultStyles: {
        labelFont: '12px Tahoma',
        labelTextFill: {
          rgbaString: 'rgba(255, 255, 255, 255)',
          rgbaObject: {
            r: 255,
            g: 255,
            b: 255,
            a: 255,
          },
        },
        nodeFill: {
          rgbaString: 'rgba(255, 255, 255, 255)',
          rgbaObject: {
            r: 255,
            g: 255,
            b: 255,
            a: 255,
          },
        },
        nodeStrokeColor: {
          rgbaString: 'rgba(255, 255, 255, 255)',
          rgbaObject: {
            r: 255,
            g: 255,
            b: 255,
            a: 255,
          },
        },
        nodeStrokeSize: '1.5px',
        nodeShape: 0,
        edgeStrokeColor: {
          rgbaString: 'rgba(255, 255, 255, 255)',
          rgbaObject: {
            r: 255,
            g: 255,
            b: 255,
            a: 255,
          },
        },
        edgeStrokeSize: '10px',
        edgeSmoothingLength: 0,
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
      isKeymapOpen: false,
      panelBottomOffset: 10,
      isLoading: false,
    };
  },
  computed: {
    dashFromStore() {
      return this.$store.state[this.idDashFrom];
    },
    primitivesFromStore() {
      if (this.dashFromStore[this.idFrom]?.options?.primitivesLibrary) {
        return JSON.parse(this.dashFromStore[this.idFrom].options.primitivesLibrary);
      }
      return [];
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
    primitivesFromStore: {
      handler() {
        this.constructorSchemes.refreshDnDPanel(this.primitivesFromStore);
      },
      deep: true,
    },
    dataRestFrom: {
      deep: true,
      handler(value) {
        if (this.constructorSchemes) {
          this.constructorSchemes.updateDataRest(value);
          this.constructorSchemes.updateDataInNode(value);
        }
      },
    },
    isKeymapOpen() {
      this.setPanelBottomOffset();
    },
  },
  mounted() {
    this.createGraph();
    this.updateDefaultElementColor = throttle(this.updateDefaultElementColor, 200);
  },
  methods: {
    updateDefaultElementColor(evt, field) {
      const updateValue = structuredClone(this.elementDefaultStyles);
      updateValue[field] = {
        rgbaObject: evt.rgba,
        rgbaString: `rgba(${evt.rgba.r}, ${evt.rgba.g}, ${evt.rgba.b}, ${evt.rgba.a})`,
      };
      this.elementDefaultStyles = updateValue;
    },
    applyOptions() {
      this.constructorSchemes.applyStylesElements(this.elementDefaultStyles);
    },
    toggleDnDPanel() {
      this.dndPanel = !this.dndPanel;
    },
    toggleLoading(isLoading) {
      this.isLoading = isLoading;
    },
    createGraph() {
      this.constructorSchemes = new ConstructorSchemesClass({
        dndPanelElem: this.$refs.dndPanel,
        elem: this.$refs.graphComponent,
        dataRest: this.dataRestFrom,
        iconsList: this.primitivesFromStore,
        elementDefaultStyles: this.elementDefaultStyles,
        openDataPanelCallback: this.openDataPanel,
        closeDataPanelCallback: this.closeDataPanel,
        savedGraph: this.savedGraph,
        updateStoreCallback: this.updateSavedGraph,
        toggleLoadingCallback: this.toggleLoading,
        isEdit: this.isEdit,
      });
      if (this.constructorSchemes) {
        this.shapeNodeStyleList = this.constructorSchemes.getShapeNodeStyleList;
        this.nodeShape = this.constructorSchemes.defaultNodeStyle.shape;
      }
    },
    changeDataSelectedNode(updatedData) {
      this.$nextTick().then(() => {
        this.constructorSchemes.updateSelectedNode(
          updatedData,
          this.updateSavedGraph,
        );
      });
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
      new Promise((resolve) => {
        this.closeDataPanel();
        this.selectedNode = structuredClone(targetElement.nodeId);
        this.dataSelectedNode = structuredClone(targetElement);
        if (targetElement.dataType) {
          this.selectedDataType = structuredClone(targetElement.dataType);
        } else {
          this.selectedDataType = 'default-node';
        }
        resolve();
      }).then(() => {
        if (targetElement.dataType !== 'image-node') {
          this.dataPanel = true;
        }
      });
    },
    orderTo(key) {
      this.constructorSchemes.orderTo(key);
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
    toggleInputMode() {
      if (this.constructorSchemes) {
        this.isEdit = this.constructorSchemes.toggleInputMode();
        if (!this.isEdit) {
          this.closeDataPanel();
          this.dndPanel = false;
        }
      }
    },
    openKeymapPanel() {
      this.isKeymapOpen = true;
    },
    setPanelBottomOffset() {
      this.$nextTick().then(() => {
        this.panelBottomOffset = this.isKeymapOpen ? this.$refs.keymap.$el.clientHeight + 5 : 10;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.dash-constructor-schemes {
  position: relative;
  overflow: hidden;
  &__loading-circular {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &__options {
    position: absolute;
    left: 20px;
    top: 0;
    display: flex;
    align-items: center;
    z-index: 10;
  }
  &__inner-options {
    display: flex;
    align-items: center;
  }
  &__keymap-button {
    position: absolute;
    right: 20px;
    bottom: 20px;
    z-index: 1;
    border-radius: 50%;
    background-color: var(--main_bg);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: .8;
  }
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
    z-index: 10;
    position: absolute;
    top: 5px;
    bottom: 15px;
    background-color: var(--main_bg);
    width: 250px;
    padding: 10px;
    transition: all .2s ease;
    pointer-events: none;
    max-height: inherit;
    overflow-y: auto;
    overflow-x: hidden;
  }
  &__dnd-panel-container {
    left: 0;
    border-radius: 0 4px 4px 0;
    transition: all .2s ease;
    transform: translateX(-100%);
    &--active {
      transform: translateX(0);
      pointer-events: all;
    }
    &--is-keymap-open {
      bottom: 405px;
    }
  }
  &__data-panel {
    right: 0;
    width: 300px;
    transform: translateX(100%);
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
    height: inherit;
  }
  &__dnd-panel ::v-deep {
    .v-expansion-panel {
      background-color: var(--main_bg) !important;
      color: var(--main_text) !important;
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
          color: var(--main_text) !important;
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
.yfiles-snap-line {
  stroke: #ff0000 !important;
}
</style>
