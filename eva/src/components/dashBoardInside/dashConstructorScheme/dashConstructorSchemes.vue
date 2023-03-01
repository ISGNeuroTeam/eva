<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      :style="{
        ...customStyle,
        'width': `${innerSize.width - 22}px`,
        'height': `${innerSize.height - 10}px`,
        background: isPanelBackHide ? 'transparent' : theme.$secondary_bg,
        margin: '0 10px',
      }"
      :class="customClass"
      v-bind="$attrs"
      class="dash-constructor-schemes"
    >
      <div
        class="dash-constructor-schemes__options"
        :class="{
          'dash-constructor-schemes__options--is-keymap-open': isKeymapOpen,
          'dash-constructor-schemes__options--edit-mode': dashboardEditMode,
          'dash-constructor-schemes__options--dnd-panel-is-open': dndPanel,
        }"
      >
        <template v-if="dashboardEditMode">
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
            z-index="1000"
          >
            <template v-slot:activator="{ on }">
              <div class="pa-3 d-flex">
                <v-icon
                  class="control-button edit-icon theme--dark"
                  :style="{ color: theme.$secondary_text }"
                  v-on="on"
                  @click="toggleDnDPanel"
                >
                  {{ dndPanel ? arrowCollapseLeft : arrowCollapseRight }}
                </v-icon>
              </div>
            </template>
            <span>Панель настроек</span>
          </v-tooltip>
          <!--Export-->
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
            z-index="1000"
          >
            <template v-slot:activator="{ on }">
              <div class="pa-3 d-flex">
                <v-icon
                  class="control-button edit-icon theme--dark"
                  :style="{ color: theme.$secondary_text }"
                  v-on="on"
                  @click="exportJSON"
                >
                  {{ fileExportOutline }}
                </v-icon>
              </div>
            </template>
            <span>Экспорт</span>
          </v-tooltip>
          <!--Import-->
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
            z-index="1000"
          >
            <template v-slot:activator="{ on }">
              <div
                class="pa-3 ma-0 d-flex"
                v-on="on"
              >
                <v-file-input
                  ref="fileInput"
                  :value="file"
                  :color="theme.$secondary_text"
                  :style="{ color: theme.$secondary_text, fill: theme.$secondary_text }"
                  class="dash-constructor-schemes__file-input ma-0"
                  hide-details
                  hide-input
                  :prepend-icon="fileImportOutline"
                  dense
                  outlined
                  label=""
                  @change="updateFile"
                />
              </div>
            </template>
            <span>Импорт</span>
          </v-tooltip>
          <template v-if="searchForBuildScheme">
            <v-tooltip
              :disabled="isLoading"
              bottom
              :color="theme.$accent_ui_color"
              z-index="1000"
            >
              <template v-slot:activator="{ on }">
                <div class="pa-3 d-flex">
                  <v-icon
                    class="control-button edit-icon theme--dark"
                    :style="{ color: theme.$secondary_text }"
                    v-on="on"
                    @click="openConfirmModal"
                  >
                    {{ cloudDownloadOutlineIcon }}
                  </v-icon>
                </div>
              </template>
              <span>Загрузить с сервера</span>
            </v-tooltip>
          </template>
          <template v-if="dataSelectedNode">
            <v-tooltip
              bottom
              :color="theme.$accent_ui_color"
              z-index="1000"
            >
              <template v-slot:activator="{ on }">
                <div class="pa-3 d-flex">
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
              z-index="1000"
            >
              <template v-slot:activator="{ on }">
                <div class="pa-3 d-flex">
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
              z-index="1000"
            >
              <template v-slot:activator="{ on }">
                <div class="pa-3 d-flex">
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
              z-index="1000"
            >
              <template v-slot:activator="{ on }">
                <div class="pa-3 d-flex">
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
        <v-tooltip
          bottom
          :color="theme.$accent_ui_color"
          z-index="1000"
        >
          <template v-slot:activator="{ on }">
            <div class="pa-3 d-flex">
              <v-icon
                class="control-button edit-icon theme--dark"
                :style="{ color: theme.$secondary_text }"
                v-on="on"
                @click="fitGraphContent"
              >
                {{ fitToPage }}
              </v-icon>
            </div>
          </template>
          <span>Выровнять по центру</span>
        </v-tooltip>
      </div>
      <div
        v-if="dashboardEditMode"
        class="dash-constructor-schemes__keymap-button"
      >
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
        :ref="`dndPanelContainer-${idFrom}`"
        class="dash-constructor-schemes__dnd-panel-container"
        :style="{
          'bottom': `${panelBottomOffset}px`,
        }"
        :class="{
          'dash-constructor-schemes__dnd-panel-container--active': dndPanel,
        }"
      >
        <div
          v-show="!isLoading"
          :ref="`dndPanel-${idFrom}`"
          class="dash-constructor-schemes__dnd-panel"
        >
          <template v-if="saveMultipleScheme">
            <v-select
              v-model="localActiveSchemeId"
              :items="allSavedSchemes"
              class="
                pt-3
                px-0
                pb-4
                dash-constructor-schemes__select-field
                dash-constructor-schemes__select-field--with-padding
              "
              label="Активная схема"
              dense
              :menu-props="{
                'offset-y': true,
                'z-index': 4000,
              }"
            >
              <template #item="{ item, on }">
                <v-list-item
                  ripple
                  class="v-list-item--link"
                  v-on="on"
                >
                  <v-list-item-content>
                    <v-list-item-title class="d-flex align-center justify-content-between">
                      <div class="mr-auto">
                        {{ item }}
                      </div>
                      <v-icon
                        class="control-button edit-icon theme--dark"
                        :style="{ color: theme.$secondary_text }"
                        @click.stop="openConfirmDeleteModal(item)"
                      >
                        {{ closeIcon }}
                      </v-icon>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </template>
            </v-select>
          </template>
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
                          <div class="column">
                            <div
                              :style="{
                                border: `1px solid ${theme.$main_border}`,
                                'border-radius': '2px',
                              }"
                              class="row ma-0 mb-2 align-center"
                            >
                              <div
                                class="col-12 text-center"
                                :style="{
                                  'border-bottom': `1px solid ${theme.$main_border}`
                                }"
                              >
                                Линия
                              </div>
                              <!--Цвет линии-->
                              <div class="col-7 text-left">
                                Цвет:
                              </div>
                              <div class="col-5">
                                <v-menu
                                  top
                                  offset-x
                                  z-index="100"
                                  :close-on-content-click="false"
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      min-width="100%"
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
                                    @update:color="updateDefaultElementColor(
                                      $event,
                                      'edgeStrokeColor'
                                    )"
                                  />
                                </v-menu>
                              </div>
                              <!--Размер линии-->
                              <div class="col-7 text-left">
                                Размер:
                              </div>
                              <div class="col-5">
                                <v-text-field
                                  v-model="elementDefaultStyles.edgeStrokeSize"
                                  outlined
                                  dense
                                  class="dash-constructor-schemes__text-field"
                                />
                              </div>
                              <!--Скругление линии-->
                              <div class="col-7 text-left">
                                Скругление:
                              </div>
                              <div class="col-5">
                                <v-text-field
                                  v-model.number="elementDefaultStyles.edgeSmoothingLength"
                                  dense
                                  outlined
                                  placeholder="Скругление"
                                  class="dash-constructor-schemes__text-field"
                                />
                              </div>
                            </div>
                            <div
                              :style="{
                                border: `1px solid ${theme.$main_border}`,
                                'border-radius': '2px',
                              }"
                              class="row ma-0 mb-2 align-center"
                            >
                              <div
                                class="col-12 text-center"
                                :style="{
                                  'border-bottom': `1px solid ${theme.$main_border}`
                                }"
                              >
                                Блок
                              </div>
                              <!--Фигура-->
                              <div class="col-12">
                                <v-select
                                  v-model="elementDefaultStyles.nodeShape"
                                  :items="shapeNodeStyleList"
                                  class="dash-constructor-schemes__select-field"
                                  item-value="id"
                                  item-text="label"
                                  label="Фигура"
                                  :menu-props="{
                                    'z-index': 100,
                                  }"
                                />
                              </div>
                              <!--Цвет блока-->
                              <div class="col-7 text-left">
                                Цвет фона:
                              </div>
                              <div class="col-5">
                                <v-menu
                                  top
                                  offset-x
                                  z-index="100"
                                  :close-on-content-click="false"
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      min-width="100%"
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
                              <div class="col-7 text-left">
                                Цвет рамки:
                              </div>
                              <div class="col-5">
                                <v-menu
                                  top
                                  offset-x
                                  z-index="100"
                                  :close-on-content-click="false"
                                >
                                  <template v-slot:activator="{ on, attrs }">
                                    <v-btn
                                      min-width="100%"
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
                                    @update:color="updateDefaultElementColor(
                                      $event,
                                      'nodeStrokeColor'
                                    )"
                                  />
                                </v-menu>
                              </div>
                              <!--Размер рамки блока-->
                              <div class="col-7 text-left text-no-wrap">
                                Размер рамки:
                              </div>
                              <div class="col-5">
                                <v-text-field
                                  v-model="elementDefaultStyles.nodeStrokeSize"
                                  dense
                                  outlined
                                  class="dash-constructor-schemes__text-field"
                                />
                              </div>
                            </div>
                            <div class="col-12 text-left">
                              <v-btn
                                outlined
                                small
                                :color="theme.$main_text"
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
        <div class="row mb-3">
          <div class="col-12">
            <div
              class="d-flex justify-content-right"
            >
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
      <component
        :is="'div'"
        :ref="`graphComponent-${idFrom}`"
        class="dash-constructor-schemes__graph-component"
        @keyup.ctrl="copyPaste"
      />
      <modal-confirm
        v-model="isConfirmModal"
        :theme="theme"
        :modal-text="`Все элементы на визуализации будут удалены. Продолжить ?`"
        btn-confirm-text="Да"
        btn-cancel-text="Нет"
        @result="startSearch"
      />
      <modal-confirm
        v-model="isConfirmModalDelete"
        :theme="theme"
        :modal-text="`Удалить выбранную схему из списка сохраненных ?`"
        btn-confirm-text="Да"
        btn-cancel-text="Нет"
        @result="deleteSavedScheme"
      />
    </div>
  </portal>
</template>

<script>
import {
  mdiArrowDown,
  mdiArrowUp,
  mdiClose,
  mdiArrowCollapseLeft,
  mdiArrowCollapseRight,
  mdiSettings,
  mdiHelp,
  mdiFitToPageOutline,
  mdiCloudDownloadOutline,
  mdiFileImport,
  mdiFileExport,
} from '@mdi/js';
import BringForward from '../../../images/bring_forward.svg';
import BringToFront from '../../../images/bring_to_front.svg';
import SendBackward from '../../../images/send_backward.svg';
import SendToBack from '../../../images/send_to_back.svg';

import ConstructorSchemesClass from '../../../js/classes/ConstructorSchemes/ConstructorSchemesClass';
import { throttle } from '@/js/utils/throttle';
import elementTemplates from '@/js/classes/ConstructorSchemes/elementTemplates';

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
    dataSources: {
      type: Object,
      default: () => ({}),
    },
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      actions: [
        { name: 'click:label', capture: ['value1', 'value2', 'value3', 'value4', 'value5'] },
      ],
      isEdit: false,
      gear: mdiSettings,
      closeIcon: mdiClose,
      arrowUp: mdiArrowUp,
      arrowCollapseLeft: mdiArrowCollapseLeft,
      arrowCollapseRight: mdiArrowCollapseRight,
      fileImportOutline: mdiFileImport,
      fileExportOutline: mdiFileExport,
      iconArrowUp: '/icons/OrderIcons/bring_to_front.svg',
      arrowDown: mdiArrowDown,
      iconHelp: mdiHelp,
      cloudDownloadOutlineIcon: mdiCloudDownloadOutline,
      fitToPage: mdiFitToPageOutline,
      dndPanel: false,
      dataPanel: false,
      nodeBgColorPopup: false,
      nodeBorderColorPopup: false,
      shapeNodeStyle: '',
      shapeNodeStyleList: [],
      elementDefaultStyles: {
        labelFont: `12px ${elementTemplates.fontFamily}`,
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
      allItems: [],
      selectedNode: '',
      selectedDataType: '',
      dataSelectedNode: null,
      isKeymapOpen: false,
      panelBottomOffset: 10,
      isLoading: false,
      isConfirmModal: false,
      isConfirmUpdateScheme: false,
      // Default value - graph
      // activeScheme: 'graph',
      timeout: null,
      timer: 0,
      isConfirmModalDelete: false,
      schemeIdForDelete: '',
      localActiveSchemeId: '',
      file: null,
    };
  },
  computed: {
    dashFromStore() {
      return this.$store.state[this.idDashFrom];
    },
    dashboardEditMode() {
      return this.dashFromStore.editMode;
    },
    optionsFromStore() {
      return this.dashFromStore[this.idFrom].options;
    },
    primitivesFromStore() {
      if (this.dashFromStore[this.idFrom]?.options?.primitivesLibrary) {
        return JSON.parse(this.dashFromStore[this.idFrom].options.primitivesLibrary)
          .map((iconName) => ({
            icon: iconName,
          }));
      }
      return [];
    },
    savedGraph() {
      return this.dashFromStore?.savedGraph || this.dashFromStore[this.idFrom]?.savedGraph || '';
    },
    savedGraphObject() {
      const savedGraph = this.dashFromStore[this.idFrom]?.savedGraphObject;
      if (savedGraph) {
        return savedGraph[this.localActiveSchemeId] || [];
      }
      return [];
    },
    tokenActionsByElType() {
      const filteredSavedElements = this.savedGraphObject
        .filter((el) => typeof el.data?.tag?.fromOtl?.type !== 'undefined');
      if (filteredSavedElements?.length > 0) {
        let result = [];

        let allChildCapture = [];
        filteredSavedElements.forEach((el) => {
          if (el.data.tag.fromOtl?.child_capture) {
            const captureList = el.data.tag.fromOtl?.child_capture.split(',');
            allChildCapture = [...new Set([...allChildCapture, ...captureList])];
          }
        });

        filteredSavedElements.forEach((el) => {
          if (el.data.tag.fromOtl?.type) {
            result.push(JSON.stringify({
              name: `click:el-parent-${el.data.tag.fromOtl.type}`,
              capture: el.data.tag.fromOtl?.parent_capture
                  && typeof el.data.tag.fromOtl.parent_capture === 'string'
                ? el.data.tag.fromOtl.parent_capture.split(',')
                : Object.keys(el.data.tag.fromOtl),
            }));
            if (allChildCapture?.length > 0) {
              result.push(JSON.stringify({
                name: `click:el-child-${el.data.tag.fromOtl.type}`,
                capture: allChildCapture,
              }));
            }
            result.push(JSON.stringify({
              name: 'click:el-child-all',
              capture: Object.keys(el.data.tag.fromOtl),
            }));
          } else {
            result.push(JSON.stringify({
              name: 'click:el-other',
              capture: el.data.tag.fromOtl?.other_capture
                  && typeof el.data.tag.fromOtl.other_capture === 'string'
                ? el.data.tag.fromOtl.other_capture.split(',')
                : Object.keys(el.data.tag.fromOtl),
            }));
          }
        });

        result = [...new Set(result)];
        return result.map((el) => JSON.parse(el));
      }
      return [];
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
    searchForBuildScheme() {
      return this.dashFromStore[this.idFrom].options.searchForBuildScheme;
    },
    dataForBuildScheme() {
      if (this.searchForBuildScheme) {
        return this.dataSources[this.searchForBuildScheme]?.data || [];
      }
      return [];
    },
    loadingSearchForBuildScheme() {
      return this.dashFromStore.searches
        .find((search) => search.id === this.searchForBuildScheme)
        ?.status === 'pending';
    },
    isPanelBackHide() {
      return this.dashFromStore[this.idFrom].options?.panelBackHide || false;
    },
    isBridgeEnable() {
      return this.optionsFromStore?.isBridgeEdgeSupport || false;
    },
    isAlwaysUpdateScheme() {
      return this.optionsFromStore?.alwaysUpdateScheme || false;
    },
    saveMultipleScheme() {
      return this.optionsFromStore?.saveMultipleScheme;
    },
    minimumLastSegmentLength() {
      return Number(this.optionsFromStore.minimumLastSegmentLength) || 30;
    },
    minimumEdgeToEdgeDistance() {
      return Number(this.optionsFromStore.minimumEdgeToEdgeDistance) || 10;
    },
    activeSchemeId() {
      if (
        this.saveMultipleScheme
          && this.optionsFromStore?.tokensBySchemeId?.length > 0
          && this.dashFromStore?.tockens?.length > 0
      ) {
        const result = [];
        this.optionsFromStore.tokensBySchemeId.forEach((tokenName) => {
          const tokenByName = this.dashFromStore.tockens.find((el) => el.name === tokenName);
          if (tokenName) {
            result.push(tokenByName.value);
          }
        });
        return result.join('-').replaceAll(' ', '_') || 'default-scheme';
      }
      return 'default-scheme';
    },
    allSavedSchemes() {
      if (this.dashFromStore[this.idFrom]?.savedGraphObject) {
        return Object.keys(this.dashFromStore[this.idFrom].savedGraphObject);
      }
      return [];
    },
  },
  watch: {
    file(value) {
      if (value) {
        this.importFrom(value);
      }
    },
    primitivesFromStore: {
      handler() {
        this.constructorSchemes.refreshDnDPanel(this.primitivesFromStore);
      },
      deep: true,
    },
    dataRestFrom(value) {
      if (this.constructorSchemes && value?.length > 0) {
        this.constructorSchemes.updateDataRest(structuredClone(value));
        this.constructorSchemes.updateDataInNode(structuredClone(value));
      }
    },
    isKeymapOpen() {
      this.setPanelBottomOffset();
    },
    fullScreenMode() {
      this.$nextTick(() => {
        this.$nextTick(() => {
          this.createGraph();
          this.updateDefaultElementColor = throttle(this.updateDefaultElementColor, 200);
          this.updateSavedGraph = throttle(this.updateSavedGraph, 1000);
        });
      });
    },
    dashboardEditMode(val) {
      this.isEdit = val;
      this.toggleInputMode();
    },
    dataForBuildScheme(value) {
      if (this.isAlwaysUpdateScheme && value?.length > 0) {
        this.constructorSchemes.buildSchemeFromSearch(
          value,
          this.minimumLastSegmentLength,
          this.minimumEdgeToEdgeDistance,
        );
      }
    },
    activeSchemeId(schemeId) {
      this.localActiveSchemeId = schemeId;
      if (!this.dashFromStore[this.idFrom].savedGraphObject[schemeId]) {
        this.updateSavedGraphObject([]);
      }
    },
    localActiveSchemeId() {
      if (this.constructorSchemes) {
        this.constructorSchemes.update(this.savedGraphObject);
      }
    },
    loadingSearchForBuildScheme(val) {
      this.toggleLoading(val);
    },
    dataSelectedNode(node) {
      if (node?.dataType === 'image-node' && this.dataForBuildScheme?.length > 0) {
        this.actions = this.actions.map((action) => {
          if (action.name !== 'click:image') {
            return action;
          }
          return {
            ...action,
            capture: Object.keys(node),
          };
        });
      }
    },
    tokenActionsByElType(value) {
      if (this.dataForBuildScheme?.length > 0) {
        this.actions = [
          { name: 'click:label', capture: ['value1', 'value2', 'value3', 'value4', 'value5'] },
          ...value,
        ];
        this.setActions();
      }
    },
  },
  created() {
    if (!this.dashFromStore[this.idFrom].savedGraphObject) {
      this.localActiveSchemeId = this.activeSchemeId || 'default-scheme';
      this.createSavedGraphObjectField();
    }
  },
  mounted() {
    this.createGraph();
    this.updateDefaultElementColor = throttle(this.updateDefaultElementColor, 200);
    this.updateSavedGraph = throttle(this.updateSavedGraph, 1000);
    this.setActions();
    this.localActiveSchemeId = this.activeSchemeId;
    this.isEdit = this.dashboardEditMode;
    if (this.constructorSchemes) {
      if (this.isAlwaysUpdateScheme && this.dataForBuildScheme?.length > 0) {
        this.constructorSchemes.buildSchemeFromSearch(
          this.dataForBuildScheme,
          this.minimumLastSegmentLength,
          this.minimumEdgeToEdgeDistance,
        );
      } else {
        this.constructorSchemes.update(this.savedGraphObject);
      }
    }
  },
  methods: {
    setActions() {
      this.$store.commit('setActions', {
        actions: JSON.parse(JSON.stringify(this.actions)),
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
    },
    getEvents({ event }) {
      let result = [];
      if (!this.$store.state[this.idDashFrom].events) {
        this.$store.commit('setState', [{
          object: this.$store.state[this.idDashFrom],
          prop: 'events',
          value: [],
        }]);
        return [];
      }
      result = this.$store.state[this.idDashFrom].events.filter((item) => (
        item.event === event
        && item.element.indexOf(`${this.idFrom}:`) !== -1
        && item.partelement === 'empty'
      ));
      return result;
    },
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
      this.$emit('setLoading', isLoading);
      this.isLoading = isLoading;
    },
    createGraph() {
      this.constructorSchemes = new ConstructorSchemesClass({
        dndPanelElem: this.$refs[`dndPanel-${this.idFrom}`],
        schemeId: this.idFrom,
        elem: this.$refs[`graphComponent-${this.idFrom}`],
        dataRest: this.dataRestFrom,
        iconsList: this.primitivesFromStore,
        elementDefaultStyles: this.elementDefaultStyles,
        openDataPanelCallback: this.openDataPanel,
        closeDataPanelCallback: this.closeDataPanel,
        savedGraph: this.savedGraph,
        savedGraphObject: this.savedGraphObject,
        updateStoreCallback: this.updateSavedGraph,
        updateStoreCallbackV2: this.updateSavedGraphObject,
        toggleLoadingCallback: this.toggleLoading,
        isEdit: this.dashboardEditMode,
        isBridgesEnable: this.isBridgeEnable,
        onClickObject: (type, data) => {
          if (!type) return;
          if (!type.includes('label-type') && type !== 'image-node') {
            return;
          }
          const { tockens: tokens } = this.$store.state[this.idDashFrom];
          if (tokens) {
            tokens.forEach(({
              name,
              action,
              capture,
              elem,
            }) => {
              if (elem === this.idFrom) {
                if (action === 'click:label' && data[capture]) {
                  this.$store.commit('setTocken', {
                    token: { name, action, capture },
                    idDash: this.idDashFrom,
                    value: data[capture],
                    store: this.$store,
                  });
                } else if (action !== '' && action.includes('click:el')) {
                  // TODO: Лучше переписать в дальнейшем, если будет такая возможность
                  if (data?.fromOtl?.token_type) {
                    if (
                      data.fromOtl.token_type.includes('child-')
                        && action.includes('click:el-child')
                    ) {
                      if (!action.includes('click:el-child-all')) {
                        const actionType = action.replace('click:el-child-', '');
                        const elType = data.fromOtl.token_type
                          .split('_')[0]
                          .replace('child-', '');
                        if (elType === actionType) {
                          this.$store.commit('setTocken', {
                            token: { name, action, capture },
                            idDash: this.idDashFrom,
                            value: data.fromOtl[capture],
                            store: this.$store,
                          });
                        }
                      } else {
                        this.$store.commit('setTocken', {
                          token: { name, action, capture },
                          idDash: this.idDashFrom,
                          value: data.fromOtl[capture],
                          store: this.$store,
                        });
                      }
                    } else if (
                      data.fromOtl.token_type.includes('parent-')
                        && action.includes('click:el-parent-')
                    ) {
                      const actionType = action.replace('click:el-parent-', '');
                      const elType = data.fromOtl.token_type.replace('parent-', '');
                      if (elType === actionType) {
                        this.$store.commit('setTocken', {
                          token: { name, action, capture },
                          idDash: this.idDashFrom,
                          value: data.fromOtl[capture],
                          store: this.$store,
                        });
                      }
                    } else if (
                      data.fromOtl.token_type.includes('other-')
                        && action.includes('click:el-other')
                    ) {
                      this.$store.commit('setTocken', {
                        token: { name, action, capture },
                        idDash: this.idDashFrom,
                        value: data.fromOtl[capture],
                        store: this.$store,
                      });
                    }
                  }
                }
              }
            });
          }
          const events = this.getEvents({ event: 'onclick' });
          if (events.length !== 0) {
            events.forEach((event) => {
              const fieldName = event.element.match(/:label-(\w+)/);
              if (event.action === 'go' && fieldName && data[fieldName[1]]) {
                this.$store.dispatch('letEventGo', {
                  event,
                  idDash: this.idDashFrom,
                  route: this.$router,
                  store: this.$store,
                  id: this.idFrom,
                });
              }
            });
          }
        },
      });
      if (this.constructorSchemes) {
        this.shapeNodeStyleList = this.constructorSchemes.getShapeNodeStyleList;
        this.nodeShape = this.constructorSchemes.defaultNodeStyle.shape;
        this.applyOptions();
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
      if (this.dashFromStore?.savedGraph) {
        this.$store.commit('setState', [{
          object: this.dashFromStore,
          prop: 'savedGraph',
          value: data,
        }]);
      }
      this.$store.commit('setState', [{
        object: this.dashFromStore[this.idFrom],
        prop: 'savedGraph',
        value: data,
      }]);
    },
    createSavedGraphObjectField() {
      if (!this.dashFromStore[this.idFrom]?.savedGraphObject) {
        this.$store.commit('setState', [{
          object: this.dashFromStore[this.idFrom],
          prop: 'savedGraphObject',
          value: {},
        }]);
      }
      if (!this.dashFromStore[this.idFrom]?.savedGraphObject[this.localActiveSchemeId]) {
        this.$store.commit('setState', [{
          object: this.dashFromStore[this.idFrom].savedGraphObject,
          prop: this.localActiveSchemeId || 'default-scheme',
          value: [],
        }]);
      }
    },
    updateSavedGraphObject(data) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timer = 500;
      this.timeout = setTimeout(() => {
        this.createSavedGraphObjectField();
        this.$store.commit('setState', [{
          object: this.dashFromStore[this.idFrom].savedGraphObject,
          prop: this.localActiveSchemeId,
          value: data,
        }]);
        if (this.dashFromStore[this.idFrom].savedGraph || this.dashFromStore.savedGraph) {
          this.updateSavedGraph('');
        }
      }, this.timer);
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
        // this.localActiveSchemeId = this.activeSchemeId;
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
    copyPaste(e) {
      e.stopPropagation();
      e.preventDefault();
      // ctrl + c
      if (e.keyCode === 67) {
        this.constructorSchemes.copyElement();
      }
      // ctrl + v
      if (e.keyCode === 86) {
        this.constructorSchemes.pasteElement();
      }
    },
    fitGraphContent() {
      this.constructorSchemes.fitGraphContent();
    },
    openConfirmModal() {
      this.isConfirmModal = true;
    },
    async startSearch(confirm) {
      if (confirm) {
        this.constructorSchemes.buildSchemeFromSearch(this.dataForBuildScheme);
      }
    },
    updateIconsList(iconsListFrom) {
      return iconsListFrom
        .filter((elementFrom) => !this.primitivesFromStore
          .some((element) => element.icon === elementFrom.icon))
        .map((element) => element.icon);
    },
    openConfirmDeleteModal(schemeIdForDelete) {
      this.schemeIdForDelete = schemeIdForDelete;
      this.isConfirmModalDelete = true;
    },
    deleteSavedScheme(isCancelDelete) {
      if (isCancelDelete) {
        const deleteFn = (object, fieldsForDelete) => {
          const result = {};
          Object.keys(object).forEach((key) => {
            if (!fieldsForDelete.includes(key)) {
              result[key] = object[key];
            }
          });
          return result;
        };
        const allSchemes = structuredClone(this.dashFromStore[this.idFrom].savedGraphObject);
        const filteredSavedSchemes = deleteFn(allSchemes, [this.schemeIdForDelete]);
        this.$store.commit('setState', [{
          object: this.dashFromStore[this.idFrom],
          prop: 'savedGraphObject',
          value: filteredSavedSchemes,
        }]);
        this.schemeIdForDelete = '';
      } else {
        this.schemeIdForDelete = '';
      }
    },
    exportJSON() {
      this.constructorSchemes.exportGraphToJSON(this.localActiveSchemeId);
    },
    importFrom(file) {
      this.constructorSchemes.importGraphFromJSON(file);
      this.file = null;
    },
    updateFile(e) {
      if (e) {
        this.file = e;
        this.$nextTick(() => {
          this.$refs.fileInput.$refs.input.value = '';
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped>

.dash-constructor-schemes {
  position: relative;
  overflow: hidden;
  &__text-field, &__select-field {
    ::v-deep.v-text-field__details {
      display: none;
    }

  }
  &__text-field {
    ::v-deep.theme--light.v-input {
      color: var(--main_text);
      .v-icon {
        color: var(--main-text);
      }
    }
  }
  &__select-field {
    &--with-padding {
      padding-left: 10px;
      padding-right: 10px;
    }
    ::v-deep {
      &.v-input__control, .v-icon__svg {
        caret-color: var(--main_text) !important;
        color: var(--main_text) !important;
        border-color: var(--main_text) !important;
      }
    }
  }
  &__switch {
    padding-left: 20px;
    ::v-deep.v-input__control {
      .v-input__slot {
        .v-input--selection-controls__input {
          .v-input--switch__track {
            color: var(--secondary_text);
          }
        }
      }
    }
  }
  &__file-input {
    ::v-deep.v-input__prepend-outer {
      margin: 0 !important;
      .v-icon__svg {
        fill: var(--secondary_text);
      }
    }
  }
  &__loading-circular {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  &__options {
    position: absolute;
    left: 0;
    top: 5px;
    display: flex;
    align-items: center;
    z-index: 10;
    padding-right: 5px;
    transition: all .2s ease;
    &--edit-mode {
      &::before {
        content: "";
        position: absolute;
        pointer-events: none;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        transition: all .2s ease;
        background-color: var(--main_bg);
        opacity: .8;
        z-index: -1;
      }
    }

    &--dnd-panel-is-open {
      left: 255px;
    }
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
