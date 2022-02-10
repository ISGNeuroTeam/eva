<template>
  <div
    class="dash-layout"
    :options="String(options)"
    :class="{ show_board: props.differentOptions.visible }"
    :style="{ boxShadow: ` 0 0 5px 5px ${props.optionsBoxShadow}` }"
  >
    <v-card
      class="dash-block"
      :style="{
        background: theme.$main_bg,
        boxShadow: `0 3px 1px -2px ${theme.$main_border},0 2px 2px 0 ${theme.$main_border},0 1px 5px 0 ${theme.$main_border}`,
      }"
    >
      <v-card-title
        v-show="
          element.split('-')[0] === 'singleValue'
            ? settings.showTitle
            : props.disappear
        "
        class="card-title open_title"
      >
        <div class="name-dash">
          <v-icon
            v-if="dataFromDB"
            class="icon"
            :color="theme.$main_border"
          >
            {{ mdiDatabaseSearch }}
          </v-icon>
          <v-icon
            v-if="searchData.length > 0"
            class="icon"
            :color="theme.$main_border"
            @click="exportDataCSV"
          >
            {{ mdiArrowDownBold }}
          </v-icon>
          <v-icon
            v-show="dataMode"
            class="icon chart"
            :color="theme.$accent_ui_color"
          >
            {{ props.icons[elemIcon] }}
          </v-icon>
          <div class="dash-capture">
            <div
              v-if="props.edit"
              class="dash-title"
              :style="{ color: theme.$main_text }"
            >
              {{ boardTitle }}
            </div>
            <div
              v-if="props.edit"
              v-show="dataMode"
              class="dash-block-id"
              :style="{ color: theme.$main_text }"
            >
              [ {{ element }} ]
              <span
                v-if="dataSourseTitle !== -1"
                class="ml-1"
              >
                {{ dataSourseTitle }}
              </span>
            </div>
            <div
              v-if="props.edit"
              v-show="dataMode"
              class="dash-block-sid"
              :style="{
                color: theme.$main_text,
                borderColor: theme.$main_border,
              }"
            >
              {{ props.sid }}
            </div>
            <v-text-field
              v-if="!props.edit"
              v-show="dataMode"
              v-model="props.name"
              clearable
              :color="theme.$accent_ui_color"
              :style="{ color: theme.$title }"
              class="dash-edit-title"
              hide-details
            />
          </div>
        </div>
        <div class="settings-dash-block">
          <div class="settings-dash">
            <v-dialog
              v-model="fullScreenMode"
              width="100%"
            >
              <template v-slot:activator="{ on: onFullScreen }">
                <v-tooltip
                  bottom
                  :color="theme.$accent_ui_color"
                  :open-delay="tooltipOpenDelay"
                  :disabled="disabledTooltip"
                >
                  <template v-slot:activator="{ on: onTooltip }">
                    <v-icon
                      class="expand"
                      :color="theme.$main_border"
                      v-on="{ ...onFullScreen, ...onTooltip }"
                      @click="fullScreenMode = !fullScreenMode"
                    >
                      {{ props.mdiArrowExpand }}
                    </v-icon>
                  </template>
                  <span>На весь экран</span>
                </v-tooltip>
              </template>
              <div
                class="full-screen-dialog"
                :style="{ height: '80vh' }"
              >
                <v-card
                  class="dash-block"
                  :style="{
                    background: theme.$main_bg,
                    boxShadow: `0 3px 1px -2px ${theme.$main_border},0 2px 2px 0 ${theme.$main_border},0 1px 5px 0 ${theme.$main_border}`,
                  }"
                >
                  <v-card-title
                    v-show="props.disappear"
                    class="card-title open_title"
                  >
                    <div class="name-dash">
                      <v-icon
                        v-if="dataFromDB"
                        class="icon"
                        :color="theme.$main_border"
                      >
                        {{ mdiDatabaseSearch }}
                      </v-icon>
                      <v-icon
                        v-show="dataMode"
                        class="icon chart"
                        :color="theme.$accent_ui_color"
                      >
                        {{ props.icons[elemIcon] }}
                      </v-icon>
                      <div class="dash-capture">
                        <div
                          v-if="props.edit"
                          class="dash-title"
                          :style="{ color: theme.$main_text }"
                        >
                          {{ boardTitle }}
                        </div>
                        <div
                          v-if="props.edit"
                          v-show="dataMode"
                          class="dash-block-id"
                          :style="{ color: theme.$main_text }"
                        >
                          [ {{ element }} ]
                          <span
                            v-if="dataSourseTitle !== -1"
                            class="ml-1"
                          >
                            {{ dataSourseTitle }}
                          </span>
                        </div>
                        <div
                          v-if="props.edit"
                          v-show="dataMode"
                          class="dash-block-sid"
                          :style="{
                            color: theme.$main_text,
                            borderColor: theme.$main_border,
                          }"
                        >
                          {{ props.sid }}
                        </div>
                        <v-text-field
                          v-if="!props.edit"
                          v-show="dataMode"
                          v-model="props.name"
                          clearable
                          :color="theme.$accent_ui_color"
                          :style="{ color: theme.$title }"
                          class="dash-edit-title"
                          hide-details
                        />
                      </div>
                    </div>
                    <div class="settings-dash-block">
                      <div class="settings-dash">
                        <v-tooltip
                          v-if="isMultiline"
                          bottom
                          :color="theme.$accent_ui_color"
                          :open-delay="tooltipOpenDelay"
                        >
                          <template v-slot:activator="{ on }">
                            <v-icon
                              class="datasource"
                              :color="theme.$main_border"
                              v-on="on"
                              @click="resetRange()"
                            >
                              {{ props.mdiMagnifyMinusOutline }}
                            </v-icon>
                          </template>
                          <span>Сбросить зум</span>
                        </v-tooltip>
                        <v-tooltip
                          bottom
                          :color="theme.$accent_ui_color"
                          :open-delay="tooltipOpenDelay"
                        >
                          <template v-slot:activator="{ on }">
                            <v-icon
                              class="expand"
                              :color="theme.$main_border"
                              v-on="on"
                              @click="fullScreenMode = !fullScreenMode"
                            >
                              {{ props.mdiArrowCollapse }}
                            </v-icon>
                          </template>
                          <span>Свернуть</span>
                        </v-tooltip>
                      </div>
                    </div>
                  </v-card-title>
                  <v-card-text
                    :is="currentElem"
                    v-show="showElement"
                    class="card-text element-itself"
                    :color-from="theme"
                    :style="{
                      color: theme.$main_text,
                      background: 'transparent',
                    }"
                    :id-from="element"
                    :id-dash-from="idDash"
                    :data-rest-from="searchData"
                    :data-mode-from="dataMode"
                    :time-format-from="props.timeFormat"
                    :size-tile-from="props.sizeTile"
                    :tooltip-from="props.tooltip"
                    :current-settings="settings"
                    :update-settings="updateSettings"
                    :width-from="fullScreenWidth"
                    :height-from="fullScreenHeight"
                    :options="props.options"
                    :is-full-screen="true"
                    :table-per-page="tablePerPage"
                    :table-page="tablePage"
                    @hideDS="hideDS($event)"
                    @setVissible="setVissible($event)"
                    @setLoading="setLoading($event)"
                    @hideLoading="props.hideLoad = true"
                    @SetRange="setRange($event)"
                    @update:table-per-page="onTableItemsPerPageChange"
                    @update:table-page="onTableIItemsPageChange"
                  />
                </v-card>
              </div>
            </v-dialog>
          </div>
          <div
            v-show="dataMode"
            class="settings-dash"
            :class="{ settings_move: props.open_gear }"
          >
            <v-tooltip
              v-if="isMultiline"
              bottom
              :color="theme.$accent_ui_color"
              :open-delay="tooltipOpenDelay"
            >
              <template v-slot:activator="{ on }">
                <v-icon
                  class="datasource"
                  :color="theme.$main_border"
                  v-on="on"
                  @click="resetRange()"
                >
                  {{ props.mdiMagnifyMinusOutline }}
                </v-icon>
              </template>
              <span>Сбросить зум</span>
            </v-tooltip>
            <v-tooltip
              bottom
              :color="theme.$accent_ui_color"
              :open-delay="tooltipOpenDelay"
            >
              <template v-slot:activator="{ on }">
                <v-icon
                  class="datasource"
                  :color="theme.$main_border"
                  v-on="on"
                  @click="switchDS(props)"
                >
                  {{ props.mdiDatabase }}
                </v-icon>
              </template>
              <span>Источник данных</span>
            </v-tooltip>
            <v-tooltip
              v-if="props.edit_icon"
              bottom
              :color="theme.$accent_ui_color"
              :open-delay="tooltipOpenDelay"
            >
              <template v-slot:activator="{ on }">
                <v-icon
                  class="pencil"
                  :color="theme.$main_border"
                  v-on="on"
                  @click="
                    () => {
                      props.edit = false;
                      props.edit_icon = false;
                    }
                  "
                >
                  {{ props.mdiPencil }}
                </v-icon>
              </template>
              <span>Переименовать</span>
            </v-tooltip>
            <v-tooltip
              v-if="!props.edit_icon"
              bottom
              :color="theme.$accent_ui_color"
              :open-delay="tooltipOpenDelay"
            >
              <template v-slot:activator="{ on }">
                <v-icon
                  class="check"
                  :color="theme.$main_border"
                  v-on="on"
                  @click="editName(props)"
                >
                  {{ props.mdiCheckBold }}
                </v-icon>
              </template>
              <span>Переименовать</span>
            </v-tooltip>
            <v-tooltip
              bottom
              :color="theme.$accent_ui_color"
              :disabled="disabledTooltip"
              :open-delay="tooltipOpenDelay"
            >
              <template v-slot:activator="{ on }">
                <v-icon
                  class="option"
                  :color="theme.$main_border"
                  v-on="on"
                  @click="switchOP()"
                >
                  {{ props.mdiSettings }}
                </v-icon>
              </template>
              <span>Настройки</span>
            </v-tooltip>
            <v-tooltip
              bottom
              :color="theme.$accent_ui_color"
              :open-delay="tooltipOpenDelay"
            >
              <template v-slot:activator="{ on }">
                <v-icon
                  class="delete"
                  :color="theme.$main_border"
                  v-on="on"
                  @click="deleteDashBoard(props)"
                >
                  {{ props.mdiTrashCanOutline }}
                </v-icon>
              </template>
              <span>Удалить</span>
            </v-tooltip>
          </div>
        </div>
      </v-card-title>
      <div
        v-if="!props.hideLoad"
        class="loading-block"
      >
        <div
          v-show="props.disappear"
          :style="{ borderColor: theme.$main_border, opacity: '0.2' }"
          class="loading-divider"
          :class="{ loading: loading, noBorder: !dataMode }"
        >
          <div
            class="loading-bar"
            :style="{ background: theme.$primary_button }"
          />
        </div>
      </div>
      <v-card-text
        v-show="!showElement"
        class="card-text"
      >
        <button
          class="selectDS"
          :style="{ color: '#FFFFFF', background: theme.$primary_button }"
          @click="chooseDS()"
        >
          Выберите источник данных
        </button>
      </v-card-text>
      <v-card-text
        :is="currentElem"
        v-show="showElement"
        class="card-text element-itself"
        :color-from="theme"
        :style="{ color: theme.$main_text, background: 'transparent' }"
        :id-from="element"
        :id-dash-from="idDash"
        :data-rest-from="searchData"
        :data-mode-from="dataMode"
        :loading="loading"
        :time-format-from="props.timeFormat"
        :size-tile-from="props.sizeTile"
        :tooltip-from="props.tooltip"
        :width-from="width"
        :height-from="height"
        :options="props.options"
        :current-settings="settings"
        :update-settings="updateSettings"
        :is-full-screen="false"
        :table-per-page="tablePerPage"
        :table-page="tablePage"
        @hideDS="hideDS($event)"
        @setVissible="setVissible($event)"
        @setLoading="setLoading($event)"
        @hideLoading="props.hideLoad = true"
        @SetRange="setRange($event)"
        @update:table-per-page="onTableItemsPerPageChange"
        @update:table-page="onTableIItemsPageChange"
      />
    </v-card>
  </div>
</template>

<script>
import {
  mdiArrowAll,
  mdiArrowCollapse,
  mdiArrowDownBold,
  mdiArrowExpand,
  mdiArrowExpandAll,
  mdiCheckBold,
  mdiChevronDown,
  mdiChevronUp,
  mdiClose,
  mdiCodeTags,
  mdiDatabase,
  mdiDatabaseSearch,
  mdiMagnifyMinusOutline,
  mdiPencil,
  mdiSettings,
  mdiTrashCanOutline,
} from '@mdi/js';
import { mapGetters } from 'vuex';
import settings from '../js/componentsSettings.js';

export default {
  props: {
    width: null,
    height: null,
    idDashFrom: null,
    dataElemFrom: null,
    dataModeFrom: null,
    dataPageFrom: null,
    loading: {
      type: Boolean,
      default: false,
    },
    searchData: Array,
    dataSourseTitle: null,
    tooltipOpenDelay: {
      type: Number,
      default: 500,
    },
  },
  data() {
    return {
      tablePerPage: 100,
      tablePage: 1,
      dataFromDB: true,
      mdiDatabaseSearch: mdiDatabaseSearch,
      mdiArrowDownBold: mdiArrowDownBold,
      fullScreenMode: false,
      disabledTooltip: false,
      settings: {
        showTitle: true,
      },
      props: {
        id: '',
        name: '',
        mdiPencil: mdiPencil,
        mdiCheckBold: mdiCheckBold,
        mdiClose: mdiClose,
        mdiArrowAll: mdiArrowAll,
        mdiArrowExpandAll: mdiArrowExpandAll,
        mdiCodeTags: mdiCodeTags,
        mdiTrashCanOutline: mdiTrashCanOutline,
        mdiMagnifyMinusOutline: mdiMagnifyMinusOutline,
        mdiDatabase: mdiDatabase,
        mdiSettings: mdiSettings,
        mdiChevronUp: mdiChevronUp,
        mdiChevronDown: mdiChevronDown,
        mdiArrowExpand: mdiArrowExpand,
        mdiArrowCollapse: mdiArrowCollapse,
        icons: {},
        edit: true,
        edit_icon: true,
        move_elem: true,
        resize_elem: true,
        datasource_elem: true,
        showOptions: true,
        arrow_coral: 'controlsInsideDash',
        resize_arrow_coral: 'controlsInsideDash',
        code_coral: 'fill:teal',
        transition: true,
        element: '',
        page: '',
        dataRest: [],
        loading: false,
        open_gear: true,
        arrow: {
          direct: 'down',
          elem: mdiChevronDown,
        },
        open_title: false,
        options: {
          visible: true,
          change: false,
          level: 1,
          boxShadow: false,
        },
        optionsBoxShadow: 'transparent',
        differentOptions: {
          visible: true,
        },
        disappear: true,
        timeFormat: '',
        sizeTile: {},
        hideLoad: false,
        tooltip: {},
        metricsMulti: [],
      },
      fullScreenWidth: 0.8 * window.innerWidth,
      fullScreenHeight: 0.8 * window.innerHeight,
    };
  },
  computed: {
    ...mapGetters(['getTockens']),
    isMultiline() {
      return !!this.element?.includes('multiLine');
    },
    getSelfTockens() {
      return this.getTockens(this.idDash);
    },
    boardTitle() {
      if (!this.props || !this.props.name) {
        return this.element;
      }
      let name = this.props.name;
      name &&
        this.getSelfTockens.forEach((token) => {
          name = name.replaceAll(`$${token.name}$`, token.value);
        });

      return name;
    },
    settingsIsOpened() {
      return this.$store.getters.getModalSettings(this.idDash).status;
    },
    theme: function () {
      return this.$store.getters.getTheme;
    },
    idDash: function () {
      return this.idDashFrom;
    },
    element: function () {
      return this.dataElemFrom;
    },
    dataMode: function () {
      console.log('computed dataMode this.dataModeFrom = ', this.dataModeFrom);
      return this.dataModeFrom;
    },
    currentElem: function () {
      // создаем некий тег элемнета который хотим добавтиь чтобы он был вида типа dash-table
      let nameElement = '';
      if (this.element) {
        let element = this.element.split('-')[0];
        nameElement = `dash-${element}`;
      }
      return nameElement;
    },
    elemIcon: function () {
      let element = '';
      if (this.element) {
        element = this.element.split('-')[0];
      }
      return element;
    },
    showElement: function () {
      // понимаем нужно ли переключать элемент между выбором ИС и самими данными '
      let show = false;
      if (this.element) {
        show = this.$store.getters.getSwitch({
          idDash: this.idDash,
          id: this.element,
        });
      }
      return show;
    },
    lastResult: function () {
      let options = this.$store.getters.getOptions({
        idDash: this.idDash,
        id: this.element,
      });
      return options.lastResult;
    },
    options: function () {
      let options = this.$store.getters.getOptions({
        idDash: this.idDash,
        id: this.element,
      });
      this.setPropsOptions(options)
      return options.change;
    },
  },
  watch: {
    dataMode(val) {
      console.log('watch dataMode', val);
      this.changeOptions(this.dataModeFrom);
      if (!this.dataModeFrom) {
        if (
          this.element.split('-')[0] === 'button' ||
          this.element.split('-')[0] === 'csvg' ||
          this.element.split('-')[0] === 'tile'
        ) {
          this.props.disappear = false;
        }
      } else {
        this.props.disappear = true;
      }
    },
    options(val) {
      console.log('watch options', val);

      let options = this.$store.getters.getOptions({
        idDash: this.idDash,
        id: this.element,
      });

      Object.keys(options).forEach((item) => {
        this.props.options[item] = options[item];
      });

      if (this.props.options.timeFormat) {
        this.props.timeFormat = this.props.options.timeFormat;
      }
      this.$set(
        this.props.sizeTile,
        'width',
        this.props.options.widthTile || ''
      );
      this.$set(
        this.props.sizeTile,
        'height',
        this.props.options.heightTile || ''
      );
      if (this.props.options.tooltip) {
        Object.keys(this.props.options.tooltip).forEach((item) => {
          this.$set(this.props.tooltip, item, this.props.options.tooltip[item]);
        });
      } else {
        this.$set(this.props.tooltip, 'texts', []);
        this.$set(this.props.tooltip, 'links', []);
        this.$set(this.props.tooltip, 'buttons', []);
      }

      this.setShadow();
    },
    fullScreenMode(to) {
      setTimeout(() => (this.disabledTooltip = to), to ? 0 : 600);
    },
    settingsIsOpened(to) {
      setTimeout(() => (this.disabledTooltip = to), to ? 0 : 600);
    },
  },
  mounted() {
    this.props.icons = settings.icons;
    this.page = this.$parent.$el.getAttribute('data-page'); // понимаем какая страница перед нами
    this.props.name = this.$store.getters.getNameDash({
      idDash: this.idDash,
      id: this.element,
    }); // получаем имя этой страницы
    if (this.props.options.boxShadow) {
      this.props.optionsBoxShadow = this.theme.$primary_button;
    } else {
      this.props.optionsBoxShadow = 'transparent';
    }
    this.$nextTick(() => {
      window.addEventListener('resize', this.onResize);
    });
  },
  methods: {
    onTableIItemsPageChange(page) {
      this.tablePage = page
    },
    onTableItemsPerPageChange(perPage) {
      this.tablePerPage = perPage
    },
    setPropsOptions(options) {
      Object.keys(options).forEach((item) => {
        this.props.options[item] = options[item];
      });
    },
    onResize() {
      this.fullScreenWidth = window.innerWidth * 0.8;
      this.fullScreenHeight = window.innerHeight * 0.8;
    },
    updateSettings(settings) {
      this.settings = JSON.parse(JSON.stringify(settings));
    },

    editName: function (props) {
      // изменяем имя элемнета
      props.edit = true;
      props.edit_icon = true;

      this.$store.commit('setNameDash', {
        name: props.name,
        id: this.element,
        idDash: this.idDash,
      });
    },
    chooseDS: function () {
      // открываем модальное окно с выбором ИС (источник данных)
      this.$store.commit('setModalSearch', {
        id: this.idDash,
        status: true,
        elem: this.element,
      });
    },
    switchDS: function () {
      // переключаем между режимами выбора данных и их отображением
      let status = !this.showElement;
      this.$store.commit('setSwitch', {
        idDash: this.idDash,
        status: status,
        id: this.element,
      });
    },
    switchOP: function () {
      this.$store.dispatch('openModalSettings', {
        path: this.idDash,
        element: this.element,
        titles: this.searchData[0] ? Object.keys(this.searchData[0]) : [],
      });
    },
    setShadow: function () {
      if (this.props.options.boxShadow) {
        this.props.optionsBoxShadow = this.theme.$primary_button;
      } else {
        this.props.optionsBoxShadow = `transparent`;
      }
    },
    setLoading: function (event) {
      if (this.element.indexOf('button') !== -1) {
        this.props.hideLoad = !event;
      }
      this.props.loading = event;
    },
    deleteDashBoard: function (props) {
      // вызываем окно для удаления элемнета
      this.$store.commit('setModalDelete', {
        id: this.idDash,
        status: true,
        elem: this.element,
        name: props.name,
        page: this.dataPageFrom,
      });
    },
    openTitle: function () {
      // открываем закрываем шапку элемнета
      if (this.props.arrow.direct === 'up') {
        this.props.arrow.elem = this.props.mdiChevronDown;
        this.props.arrow.direct = 'down';
      } else {
        this.props.arrow.elem = this.props.mdiChevronUp;
        this.props.arrow.direct = 'up';
      }
      this.props.open_title = !this.props.open_title;
    },
    hideDS: function () {
      // функция которая для определенного элемента сразу вносит ряд настроек визуализации=
      this.$store.commit('setSwitch', {
        idDash: this.idDash,
        status: true,
        id: this.element,
      }); // сразу переключаем элемнет на отображение данных,
    },
    setVissible: function (event) {
      if (event.split('-')[0] === 'picker' || event.split('-')[0] === 'guntt') {
        // собственно если элемнет выбора даты и времен
        // поскольку запроса данных никакого не надо
        this.$el.querySelector('.dash-block').style.overflow = 'visible'; // и еще меняем скрытие элемнета,  чтобы раскрывающийся список вылазхил из него
      }
    },
    changeOptions: function (mode) {
      let level = this.props.options.level;
      let opacity = 1;
      if (mode) {
        this.props.differentOptions.visible = true;
      } else {
        if (!this.props.options.visible) {
          this.props.differentOptions.visible = false;
          opacity = 0;
        } else {
          this.props.differentOptions.visible = true;
          opacity = 1;
        }
      }
      this.$emit('SetOpacity', opacity);
      this.$emit('SetLevel', level);
    },
    // getDataFromRest: async function (event) {
    //   // this.$set(this.loadings,event.sid,true);
    //   this.$store.commit('setLoading', {
    //     search: event.sid,
    //     idDash: this.idDash,
    //     should: true,
    //     error: false,
    //   })
    //
    //   this.$store.auth.getters.putLog(`Запущен запрос  ${event.sid}`)
    //   let response = await this.$store.getters.getDataApi({
    //     search: event,
    //     idDash: this.idDash,
    //   }) // собственно проводим все операции с данными
    //   // вызывая метод в хранилище
    //   if (response.length == 0) {
    //     // если что-то пошло не так
    //     this.$store.commit('setLoading', {
    //       search: event.sid,
    //       idDash: this.idDash,
    //       should: false,
    //       error: true,
    //     })
    //   } else {
    //     // если все нормально
    //
    //     let responseDB = this.$store.getters.putIntoDB(response, event.sid, this.idDash)
    //     responseDB.then((result) => {
    //       this.$store.commit('setLoading', {
    //         search: event.sid,
    //         idDash: this.idDash,
    //         should: false,
    //         error: false,
    //       })
    //     })
    //   }
    //   return response
    // },
    exportDataCSV() {
      const searchId = this.$store.getters.getSearchID({
        idDash: this.idDash,
        id: this.element,
      });
      this.$emit('downloadData', searchId);
    },

    // moveElem: function (props) {  // переключаем режим разрешения перемещения элемента
    //   if (props.move_elem) {
    //     props.arrow_coral = 'controlsActive';
    //     this.$emit('moveElem');  // так как это переключается у родителя, мы вынуждены вызывать событие на родителе и передавтаь туда данные
    //     props.move_elem = !props.move_elem;
    //   } else {
    //     props.arrow_coral = 'controlsInsideDash';
    //     this.$emit('moveElem');
    //     this.$emit('sendMove');
    //     props.move_elem = !props.move_elem;
    //   }
    // },
    // resizeElem: function (props) {  // тоже самое для режима изменения размера
    //   if (props.resize_elem) {
    //     props.resize_arrow_coral = 'controlsActive';
    //     props.transition = !props.transition;
    //     this.$emit('resizeElem');
    //     props.resize_elem = !props.resize_elem;
    //   } else {
    //     props.resize_arrow_coral = 'controlsInsideDash';
    //     props.transition = !props.transition;
    //     this.$emit('resizeElem');
    //     this.$emit('sendSize');
    //     props.resize_elem = !props.resize_elem;
    //   }
    // },
    getData: function (searchID) {
      // асинхронная функция для получения даных с реста
      let db = null;
      let request = indexedDB.open('EVA', 1);
      request.onerror = function (event) {
        console.log('error: ', event);
      };
      request.onupgradeneeded = (event) => {
        console.log('create');
        db = event.target.result;
        if (!db.objectStoreNames.contains('searches')) {
          // if there's no "books" store
          db.createObjectStore('searches'); // create it
        }
        request.onsuccess = () => {
          db = request.result;
          console.log('successEvent: ' + db);
        };
      };
      return new Promise((resolve) => {
        request.onsuccess = () => {
          db = request.result;
          let transaction = db.transaction('searches'); // (1)
          // получить хранилище объектов для работы с ним
          let searches = transaction.objectStore('searches'); // (2)
          let query = searches.get(String(searchID)); // (3) return store.get('Ire Aderinokun');
          query.onsuccess = () => {
            // (4)
            if (query.result) {
              resolve(query.result);
            } else {
              resolve([]);
            }
          };
          query.onerror = function () {
            console.log('Ошибка', query.error);
          };
        };
      });
    },
    checkFilter: function () {
      let events = this.$store.getters.getEvents({
        idDash: this.idDash,
        event: 'OnDataCompare',
        element: this.element,
      });
      let data = [];
      let incl = false;
      let columnDel = '';
      let event = {};
      this.searchData = [];

      events.forEach((item) => {
        event = { ...{}, ...item };

        if (event.prop === 'filter' && event.value === 'true') {
          data = JSON.parse(JSON.stringify(this.props.dataRest));
          event.row = event.row.replace(/[[\]]/g, '').split(',');

          if (event.column.indexOf('!') !== -1) {
            columnDel = event.column.replace('!', '');
            this.props.dataRest.forEach((itemFil, i) => {
              if (Object.keys(itemFil).includes(columnDel)) {
                delete data[i][columnDel];
              }
            });
          } else {
            let notArr;
            switch (event.compare) {
              case 'equals':
                notArr = [];
                event.row.forEach((notElem) => {
                  if (notElem.indexOf('!') !== -1) {
                    notArr.push(notElem.substr(1));
                  }
                });
                if (event.column !== '') {
                  data = data.filter((itemFil) => {
                    if (notArr.length !== 0) {
                      if (!notArr.includes(String(itemFil[event.column]))) {
                        return itemFil;
                      }
                    } else {
                      if (event.row.includes(String(itemFil[event.column]))) {
                        return itemFil;
                      }
                    }
                  });
                } else {
                  data = data.filter((itemFil) => {
                    if (notArr.length !== 0) {
                      incl = true;
                      Object.values(itemFil).forEach((val) => {
                        if (notArr.includes(String(val))) {
                          incl = false;
                        }
                      });
                    } else {
                      incl = false;
                      Object.values(itemFil).forEach((val) => {
                        if (event.row.includes(String(val))) {
                          incl = true;
                        }
                      });
                    }
                    if (incl) {
                      return itemFil;
                    }
                  });
                }
                break;
              case 'over':
                if (event.column !== '') {
                  data = data.filter((itemFil) => {
                    incl = true;
                    event.row.forEach((row) => {
                      if (
                        parseFloat(itemFil[event.column]) <= parseFloat(row)
                      ) {
                        incl = false;
                      }
                    });
                    if (incl) {
                      return itemFil;
                    }
                  });
                }
                break;
              case 'less':
                if (event.column !== '') {
                  data = data.filter((itemFil) => {
                    incl = true;
                    event.row.forEach((row) => {
                      if (
                        parseFloat(itemFil[event.column]) >= parseFloat(row)
                      ) {
                        incl = false;
                      }
                    });
                    if (incl) {
                      return itemFil;
                    }
                  });
                }
                break;
              case 'in':
                if (event.column !== '') {
                  data = data.filter((itemFil) => {
                    if (event.row.includes(String(itemFil[event.column]))) {
                      return itemFil;
                    }
                  });
                } else {
                  data = data.filter((itemFil) => {
                    incl = false;
                    Object.values(itemFil).forEach((val) => {
                      if (event.row.includes(String(val))) {
                        incl = true;
                      }
                    });
                    if (incl) {
                      return itemFil;
                    }
                  });
                }
                break;
              case 'between':
                if (event.column !== '') {
                  data = data.filter((itemFil) => {
                    incl = false;
                    let min, max;
                    if (parseFloat(event.row[0]) > parseFloat(event.row[1])) {
                      max = event.row[0];
                      min = event.row[1];
                    } else {
                      max = event.row[1];
                      min = event.row[0];
                    }
                    if (
                      parseFloat(itemFil[event.column]) > min &&
                      parseFloat(itemFil[event.column]) < max
                    ) {
                      incl = true;
                    }
                    if (incl) {
                      return itemFil;
                    }
                  });
                }
                break;
            }
          }
          if (this.searchData.length === 0) {
            this.searchData = [...this.searchData, ...data];
          } else {
            // если в массив результирующем уже что-то было, то надо добавить только новые элементы
            data.forEach((itemData) => {
              // пробегаемся по все мотфильтрвоанным элементам
              let equal = false; // переменная которая скажет встречается ли такая строка уже в выборке
              let keys = Object.keys(itemData); // ключи объекта внутри фильтрованного массива
              this.searchData.forEach((itemDataRest) => {
                // пробегаемся пов сем отфильтрованным данным
                let equalRest = true; // переменная которая скажет полностью совпал объект внутри результирующего массива
                keys.forEach((key) => {
                  // пробегаемся по кажлому полю в объекте
                  if (itemData[key] !== itemDataRest[key]) {
                    // если значения поля из только что отфильтрованного массива, не равно значени в уже до
                    // этого отфильтрованном массиве, то значит что строка не полностью совпала, а значит строки не равны
                    equalRest = false; // поэтому присваиваем переменной значение мол строки отличаются
                  }
                });
                if (equalRest) {
                  // а вот если строка в только что отфлильтрованном массиве полностью совпала со строкой в уже до этого отфильтрованном
                  equal = true; // то присваиваем true переменной которай говорит что такая строка уже есть
                }
              });
              if (!equal) {
                // и вот если такой строки все же нет
                this.searchData.push(itemData); // то смело добовляем ее в результирующий массив
              }
            });
          }
        }
      });
      if (data.length === 0) {
        this.searchData = JSON.parse(JSON.stringify(this.props.dataRest));
      }
    },
    setRange(range) {
      this.$emit('SetRange', range);
    },
    resetRange() {
      this.$emit('ResetRange', this.dataSourseTitle);
    },
  },
};
</script>

<style lang="scss">
@import '../sass/dashBoard.sass';
</style>
<style lang="sass">
.settings-dash
    .v-icon:focus::after
        opacity: 0
</style>
