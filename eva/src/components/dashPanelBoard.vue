<template>
  <div>
    <div class="dash-main" :style="{ background: theme.$main_bg }">
      <div class="main-title">
        <div class="logo-block">
          <EvaLogo />
        </div>
        <div class="title-name" :style="{ color: theme.$title }">
          {{ name }}
        </div>
        <v-tooltip bottom :color="theme.$accent_ui_color">
          <template v-slot:activator="{ on }">
            <v-icon class="home" :color="theme.$secondary_text" v-on="on" @click="toHome">
              {{ home }}
            </v-icon>
          </template>
          <span>На главную</span>
        </v-tooltip>
        <v-tooltip bottom :color="theme.$accent_ui_color">
          <template v-slot:activator="{ on }">
            <v-icon class="undo" :color="theme.$secondary_text" v-on="on" @click="toBackward">
              {{ undo }}
            </v-icon>
          </template>
          <span>Назад</span>
        </v-tooltip>
      </div>
      <div class="control-block">
        <div class="edit-container" :class="{ hide_control: !editMode }">
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="control-button theme--dark"
                :style="{ color: theme.$secondary_text }"
                :class="{ hide_control: !editMode }"
                v-on="on"
                @click="openEventCode"
              >
                {{ code_icon }}
              </v-icon>
            </template>
            <span>События</span>
          </v-tooltip>
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="control-button theme--dark"
                :style="{ color: theme.$secondary_text }"
                :class="{ hide_control: !editMode }"
                v-on="on"
                @click="openTockenCode"
              >
                {{ tocken_icon }}
              </v-icon>
            </template>
            <span>Токены</span>
          </v-tooltip>
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="control-button theme--dark"
                :style="{ color: theme.$secondary_text }"
                :class="{ hide_control: !editMode }"
                v-on="on"
                @click="openSearchCode"
              >
                {{ search_icon }}
              </v-icon>
            </template>
            <span>Источники даных</span>
          </v-tooltip>
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="control-button theme--dark"
                :style="{ color: theme.$secondary_text }"
                :class="{ hide_control: !editMode }"
                v-on="on"
                @click="openToolPanel"
              >
                {{ tool_icon }}
              </v-icon>
            </template>
            <span>Визуализации</span>
          </v-tooltip>
        </div>
        <div class="user-control-panel">
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="control-button theme--dark"
                :style="{ color: theme.$secondary_text }"
                v-on="on"
                @click="openFilterPanel"
              >
                {{ filterIcon }}
              </v-icon>
            </template>
            <span>Открыть настройки фильтров</span>
          </v-tooltip>
          <v-tooltip v-if="editPermission" bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="control-button edit-icon theme--dark"
                :style="{ color: theme.$secondary_text }"
                v-on="on"
                @click="gearShow = !gearShow"
              >
                {{ gear }}
              </v-icon>
            </template>
            <span>Открыть настройки дашборда</span>
          </v-tooltip>
          <v-tooltip v-if="editPermission" bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="control-button theme--dark"
                :style="{ color: theme.$secondary_text }"
                v-on="on"
                @click="openSave"
              >
                {{ save_icon }}
              </v-icon>
            </template>
            <span>Сохранить</span>
          </v-tooltip>
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="control-button theme--dark"
                :color="
                  $store.getters.getColorError ? theme.$primary_button : theme.$secondary_text
                "
                v-on="on"
                @click="openLogs"
              >
                {{ logIcon }}
              </v-icon>
            </template>
            <span>Открыть окно логов</span>
          </v-tooltip>
        </div>
        <v-menu :nudge-width="100" :rounded="false" offset-y>
          <template v-slot:activator="{ on: onMenu }">
            <v-tooltip bottom :color="theme.$accent_ui_color">
              <template v-slot:activator="{ on: onTooltip }">
                <div class="dropdown-profile" v-on="{ ...onMenu, ...onTooltip }">
                  <v-icon :style="{ color: theme.$secondary_text }" class="profile theme--dark">
                    {{ profile_icon }}
                  </v-icon>
                  <div class="id-user profile-login" :style="{ color: theme.$secondary_text }">
                    {{ login }}
                  </div>
                </div>
              </template>
              <span>Меню профиля</span>
            </v-tooltip>
          </template>
          <v-list class="profile-dropdown--list">
            <v-list-item>
              <v-list-item-title class="profile-dropdown--title">Профиль</v-list-item-title>
            </v-list-item>
            <div v-for="item in profileDropdownButtons" :key="item.id">
              <v-list-item v-if="!item.hide">
                <v-btn class="profile-dropdown--button" icon v-on="on" @click="item.onClick">
                  <v-icon class="edit icon-aut" :color="theme.$secondary_text">
                    {{ item.icon }}
                  </v-icon>
                  {{ item.label }}
                </v-btn>
              </v-list-item>
            </div>
          </v-list>
        </v-menu>
      </div>
      <div
        ref="blockCode"
        class="block-code"
        :class="{ opencode: opencode }"
        :style="{ background: theme.$main_bg, color: theme.$main_text }"
      >
        <div class="iconsNavigations">
          <v-icon :color="theme.$primary_button" @click="runAllSearches">
            {{ mdiAnimationPlay }}
          </v-icon>
          <v-icon :color="theme.$primary_button" @click="openModal">
            {{ plus_icon }}
          </v-icon>
        </div>

        <div
          v-for="search in searches"
          :key="search.sid"
          class="searches-one"
          @click="openEditSearch($event, search.sid)"
        >
          <div
            class="search-id"
            :style="{
              background: theme.$accent_ui_color,
              color: '#fff',
              border: `1px solid ${theme.$accent_ui_color}`,
              width: '65px'
            }"
          >
            {{ checkSid(search.sid) }}
          </div>
          <div
            class="search-query"
            :style="{
              background: theme.$secondary_bg,
              color: theme.$main_text,
              border: `1px solid ${theme.$main_border}`,
            }"
          >
            {{ search.original_otl }}
            <div
              class="loading-bar"
              :style="{ background: theme.$accent_ui_color }"
              :class="{ loading: search.status === 'pending' }"
            />
          </div>
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="search-play"
                :color="theme.$primary_button"
                v-on="on"
                @click="startSearch(search)"
              >
                {{ play }}
              </v-icon>
            </template>
            <span>Запустить ИД</span>
          </v-tooltip>
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="search-pencil"
                :color="theme.$primary_button"
                v-on="on"
                @click="openEdit(search.sid)"
              >
                {{ pencil }}
              </v-icon>
            </template>
            <span>Редактировать ИД</span>
          </v-tooltip>
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="search-clock"
                :color="theme.$primary_button"
                v-on="on"
                @click="openSchedule(search.sid)"
              >
                {{ clock }}
              </v-icon>
            </template>
            <span>Планировщик</span>
          </v-tooltip>
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="search-clock"
                :color="theme.$primary_button"
                :disabled="search.status !== 'downloaded'"
                v-on="on"
                @click="exportSearch(search.sid)"
              >
                {{ download }}
              </v-icon>
            </template>
            <span>Экспортировать ИД</span>
          </v-tooltip>
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="search-clock"
                :color="theme.$primary_button"
                v-on="on"
                @click="(modalPaperSid = search.sid), (modalPaper = true)"
              >
                {{ paper }}
              </v-icon>
            </template>
            <span>Создать отчет</span>
          </v-tooltip>
          <v-tooltip bottom :color="theme.$accent_ui_color">
            <template v-slot:activator="{ on }">
              <v-icon
                class="search-trash"
                :color="theme.$primary_button"
                v-on="on"
                @click="deleteSearch(search.sid)"
              >
                {{ trash }}
              </v-icon>
            </template>
            <span>Удалить ИД</span>
          </v-tooltip>
        </div>
        <v-btn small class="create-search" :color="theme.$primary_button" @click="openModal">
          Создать
        </v-btn>
      </div>
      <div
        class="block-tool"
        :class="{ opentool: opentool }"
        :style="{ background: theme.$main_bg, color: theme.$main_text }"
      >
        <div
          v-for="tool in tools"
          :key="tool.name"
          class="tool-one draggable"
          :data-type="tool.type"
          @mousedown="dragTool"
        >
          <div
            class="tool-img"
            :style="{
              background: theme.$accent_ui_color,
              border: `2px solid ${theme.$accent_ui_color}`,
            }"
          >
            <v-icon class="tool-img-itself" :style="{ color: '#FFF' }">
              {{ `${tool.img}` }}
            </v-icon>
          </div>
          <div
            class="tool-name"
            :style="{
              background: theme.$main_bg,
              color: theme.$main_text,
              border: `1px solid ${theme.$main_border}`,
            }"
          >
            {{ tool.name }}
          </div>
        </div>
      </div>
      <div
        class="block-tocken"
        :class="{ opentocken: opentocken }"
        :style="{ background: theme.$main_bg, color: theme.$main_text }"
      >
        <div
          v-for="(tocken, i) in tockens"
          :key="tocken.name"
          class="row-tocken"
          :style="{ color: theme.$main_text }"
        >
          <div class="row-data row-itself" :class="{ showTocken: !lookTockens[i].show }">
            <v-text-field
              v-model="tockensName[tocken.name]"
              class="tocken-name theme--dark"
              :color="theme.$accent_ui_color"
              outlined
              label="Имя"
              hide-details
            />
            <v-select
              v-model="tocken.elem"
              :items="elements"
              :color="theme.$accent_ui_color"
              label="Элемент"
              hide-details
              outlined
              class="tocken-elem theme--dark"
              @click="changeColor"
            />
            <v-select
              v-model="tocken.action"
              :items="actions(tocken.elem)"
              :color="theme.$accent_ui_color"
              label="Действие"
              hide-details
              outlined
              class="tocken-action theme--dark"
              @click="changeColor"
            />
            <v-select
              v-model="tocken.capture"
              :items="capture({ action: tocken.action, elem: tocken.elem })"
              :color="theme.$accent_ui_color"
              label="Свойство"
              hide-details
              outlined
              class="tocken-capture theme--dark"
              @click="changeColor"
            />
            <v-text-field
              v-model="tocken.prefix"
              class="tocken-prefix theme--dark"
              :color="theme.$accent_ui_color"
              label="Префикс"
              outlined
              hide-details
            />
            <v-text-field
              v-model="tocken.sufix"
              class="tocken-sufix theme--dark"
              :color="theme.$accent_ui_color"
              label="Суффикс"
              outlined
              hide-details
            />
            <v-text-field
              v-model="tocken.delimetr"
              class="tocken-delimetr theme--dark"
              :color="theme.$accent_ui_color"
              label="Разделитель"
              outlined
              hide-details
            />
            <v-text-field
                v-model="tocken.defaultValue"
                class="tocken-default-value theme--dark"
                :color="theme.$accent_ui_color"
                label="По умолчанию"
                outlined
                hide-details
            />
          </div>
          <p
            class="tocken-view"
            :class="{ showView: lookTockens[i].show }"
            :color="theme.$main_text"
          >
            {{ tocken.value }}
          </p>
          <v-icon
            class="row-check"
            :color="theme.$primary_button"
            :class="{ showIcon: lookTockens[i].show }"
            @click="saveTocken()"
          >
            {{ check }}
          </v-icon>
          <v-icon class="row-look" :color="theme.$primary_button" @click="lookTocken(i)">
            {{ look }}
          </v-icon>
          <v-icon
            class="row-trash"
            :color="theme.$primary_button"
            :class="{ showIcon: lookTockens[i].show }"
            @click="deleteTocken(tocken.name)"
          >
            {{ trash }}
          </v-icon>
        </div>
        <div
          class="row-tocken new"
          :class="{ opennewtocken: opennewtocken }"
          :style="{ borderTop: `1px solid ${theme.$main_border}` }"
        >
          <v-text-field
            v-model="newTockenName"
            class="tocken-name theme--dark"
            :color="theme.$main_text"
            label="Имя"
            outlined
            hide-details
          />
          <v-select
            v-model="newElem"
            :items="elements"
            :color="theme.$main_text"
            hide-details
            outlined
            class="tocken-elem theme--dark"
            label="Элемент"
            @click="changeColor"
          />
          <v-select
            v-model="newAction"
            :items="actions(newElem)"
            :color="theme.$main_text"
            hide-details
            outlined
            class="tocken-action theme--dark"
            label="Действие"
            @click="changeColor"
          />
          <v-select
            :items="capture({ action: newAction, elem: newElem })"
            :color="theme.$main_text"
            hide-details
            outlined
            class="tocken-capture theme--dark"
            label="Свойство"
            @click="changeColor"
          />
          <v-text-field
            v-model="newTockenDop.prefix"
            class="tocken-prefix theme--dark"
            :color="theme.$main_text"
            label="Префикс"
            outlined
            hide-details
          />
          <v-text-field
            v-model="newTockenDop.sufix"
            class="tocken-sufix theme--dark"
            :color="theme.$main_text"
            label="Суффикс"
            outlined
            hide-details
          />
          <v-text-field
            v-model="newTockenDop.delimetr"
            class="tocken-delimetr theme--dark"
            :color="theme.$main_text"
            label="Разделитель"
            outlined
            hide-details
          />
          <v-text-field
              v-model="newTockenDop.defaultValue"
              class="tocken-default-value theme--dark"
              :color="theme.$accent_ui_color"
              label="По умолчанию"
              outlined
              hide-details
          />
          <v-icon class="row-check" :color="theme.$primary_button" @click="saveTocken()">
            {{ check }}
          </v-icon>
        </div>
        <v-icon
          v-if="showSign"
          class="row-plus"
          :color="theme.$primary_button"
          @click="
            () => {
              showSign = !showSign;
              opennewtocken = !opennewtocken;
            }
          "
        >
          {{ plus_icon }}
        </v-icon>
        <v-icon
          v-if="!showSign"
          class="row-minus"
          :color="theme.$primary_button"
          @click="
            () => {
              showSign = !showSign;
              opennewtocken = !opennewtocken;
            }
          "
        >
          {{ minus_icon }}
        </v-icon>
      </div>
      <div
        class="block-event"
        :class="{ openevent: openevent }"
        :style="{ background: theme.$main_bg }"
      >
        <v-textarea
          v-model="textarea_event"
          spellcheck="false"
          :textAreaFull="textareaEv"
          :color="theme.$main_text"
          :style="{ color: theme.$main_text }"
          auto-grow
          outlined
          class="textarea-event"
          label="Начните писать событие"
          hide-details
          clearable
        />
        <v-btn class="event-btn" :color="theme.$primary_button" @click="setEvents">
          Подтвердить
        </v-btn>
      </div>
      <div
        class="block-save"
        :class="{ opensave: opensave }"
        :style="{ background: theme.$main_bg }"
      >
        <div v-show="!errorSave" class="save-obertka">
          <div class="question-save" :style="{ color: theme.$main_text }">
            Сохранить дашборд
            <span class="save-name">
              {{ name }}
            </span>
            ?
          </div>
          <div class="buttons-save">
            <v-btn class="save-btn" small :color="theme.$primary_button" @click="saveDash">
              Да
            </v-btn>
            <v-btn
              class="save-btn"
              small
              :color="theme.$primary_button"
              @click="
                opensave = false;
                save_elem = false;
              "
            >
              Нет
            </v-btn>
          </div>
        </div>
        <div v-show="errorSave" class="save-obertka message-save">
          <div class="question-save" :style="{ color: theme.$error_color }">
            {{ msgErrorSave }}
          </div>
        </div>
      </div>
      <div
        class="warning-block"
        :style="{
          background: theme.$main_bg,
          border: `1px solid ${theme.$main_border}`,
          color: theme.$main_text,
          bottom: `-${otstupBottom}px`,
        }"
      >
        <div class="warning-text">
          {{ msgWarn }}
        </div>
        <div class="btn-warning">
          <v-btn
            small
            :color="theme.$primary_button"
            class="warning-btn yes-btn"
            @click="yesSearch"
          >
            Да
          </v-btn>
          <v-btn small :color="theme.$primary_button" class="warning-btn" @click="noSearch">
            Нет
          </v-btn>
        </div>
      </div>
      <modal-create-search
        :idDashFrom="idDash"
        :modalFrom="activeModal"
        :createBtnFrom="createSearchBtn"
        :dataSearchFrom="newSearch"
        @cancelModal="cancelModal"
      />
      <modal-themes :show="paleteShow" :admin="isAdmin" @closeModal="paleteShow = false" />
      <modal-schedule
        :idDashFrom="idDash"
        :colorFrom="theme"
        :modalFrom="activeSchedule"
        :dataSidFrom="scheduleSid"
        @cancel="activeSchedule = false"
      />
      <modal-log :modal-active="modalActive" @cancelModal="modalActive = false" />
      <dash-settings
        :gear-from="gearShow"
        :permissions-from="userPermissions"
        :idDashFrom="idDashFrom"
        @changeMode="setEditMode"
      />
      <modal-paper
        :active="modalPaper"
        :sid="modalPaperSid"
        :id-dash="idDash"
        @cancelModal="cancelModal"
      />
    </div>

    <div class="block-filter" :class="{ openfilter }">
      <dash-filter-panel
        :permissions-from="userPermissions"
        :idDashFrom="idDashFrom"
        :editPermission="editPermission"
        :editMode="editMode"
      >
      </dash-filter-panel>
    </div>
  </div>
</template>

<script>
import {
  mdiPlusBox,
  mdiDoor,
  mdiCompare,
  mdiScriptTextOutline,
  mdiAnimationPlay,
  mdiUndoVariant,
  mdiAccountEdit,
  mdiPlay,
  mdiEye,
  mdiFileDocumentOutline,
  mdiArrowDownBold,
  mdiContentSave,
  mdiAccount,
  mdiHomeVariantOutline,
  mdiSettings,
  mdiHelpCircleOutline,
  mdiClockOutline,
  mdiDatabase,
  mdiTableEdit,
  mdiCodeTags,
  mdiTrashCanOutline,
  mdiMinusBox,
  mdiToolbox,
  mdiPencil,
  mdiVariable,
  mdiCheckBold,
  mdiSwapVerticalBold,
  mdiFilter,
} from '@mdi/js'
import EvaLogo from '../images/eva-logo.svg'


import settings from '../js/componentsSettings.js'
import DashFilterPanel from './dash-filter-panel/DashFilterPanel'

export default {
  components: {
    EvaLogo,
    DashFilterPanel,
  },
  props: {
    idDashFrom: null,
    inside: null,
    horizontalCell: null
  },
  data() {
    return {
      login: '',
      on: false,
      userEdit: mdiAccountEdit,
      search_elem: false,
      undo: mdiUndoVariant,
      help_icon: mdiHelpCircleOutline,
      search_icon: mdiDatabase,
      modalActive: false,
      tool_elem: false,
      tocken_elem: false,
      profile_elem: false,
      save_elem: false,
      editMode: true,
      code_elem: false,
      check: mdiCheckBold,
      look: mdiEye,
      tool_icon: mdiToolbox,
      tocken_icon: mdiVariable,
      profile_icon: mdiAccount,
      plus_icon: mdiPlusBox,
      minus_icon: mdiMinusBox,
      trash: mdiTrashCanOutline,
      edit_layout: mdiTableEdit,
      code_icon: mdiCodeTags,
      save_icon: mdiContentSave,
      pencil: mdiPencil,
      play: mdiPlay,
      clock: mdiClockOutline,
      download: mdiArrowDownBold,
      paper: mdiFileDocumentOutline,
      mdiAnimationPlay,
      help_elem: true,
      help_coral: 'fill:teal',
      opencode: false,
      openevent: false,
      openexin: false,
      opentool: false,
      opentocken: false,
      opensearch: false,
      openfilter: false,
      opensave: false,
      openexim: false,
      sign: true,
      gearShow: false,
      gear: mdiSettings,
      filterIcon: mdiFilter,
      exim: mdiSwapVerticalBold,
      home: mdiHomeVariantOutline,
      logIcon: mdiScriptTextOutline,
      openhelp: false,
      newDashBoard: {},
      lookTockens: [],
      tools: [],
      avatar: null,
      mdiCompare: mdiCompare,
      tempTocken: {},
      change: {},
      profileDropdownButtons: [
        {
          id: 1,
          label: 'Редактировать',
          icon: mdiAccountEdit,
          onClick: this.edit,
          hide: this.inside,
        },
        {
          id: 2,
          label: 'Тема',
          icon: mdiCompare,
          onClick: this.openThemeModal,
        },
        {
          id: 3,
          label: 'Выйти',
          icon: mdiDoor,
          onClick: this.exit,
        },
      ],
      textarea: '',
      showSign: true,
      newTockenName: null,
      opennewtocken: false,
      newTockenDop: {
        defaultValue: '*'
      },
      newElem: '',
      newAction: '',
      tockensName: {},
      msgWarn: '',
      textarea_event: '',
      events: [],
      event: {},
      newSearch: {
        sid: null,
        original_otl: null,
        parametrs: {
          tws: 0,
          twf: 0,
          username: 'admin',
          timeout: 60,
          preview: false,
          field_extraction: false,
          cache_ttl: 60,
        },
      },
      activeModal: false,
      paleteShow: false,
      activeSchedule: false,
      scheduleSid: -1,
      loadings: {},
      dbOpen: null,
      colorGear: '',
      colorExim: '',
      fieldsets: null,
      otstupBottom: 550,
      errorSave: false,
      msgErrorSave: '',
      colorErrorSave: '',
      createSearchBtn: '',
      disabledDS: {},
      modalPaperSid: '',
      modalPaper: false,
      userPermissions: [],
    }
  },
  computed: {
    idDash: function () {
      return this.idDashFrom
    },

    headerTop() {
      return document.body.clientWidth <= 1400 ? 40 : 50
    },
    isAdmin() {
      return this.userPermissions && this.userPermissions.includes('admin_all');
    },
    searches: function () {
      // массив со всеми ИС на странице
      let searchesRes = [];
      if (this.idDash) {
        let searches = this.$store.getters.getSearches(this.idDash);
        searches.forEach((item) => {
          this.$set(this.change, item.sid, false);
        });
        searchesRes = searches;
      }
      return searchesRes;
    },
    name: function () {
      return this.$store.getters.getName(this.idDash);
    },
    theme: function () {
      return this.$store.getters.getTheme;
    },
    editPermission: function () {
      if (
        this.userPermissions.includes('admin_all') ||
        this.userPermissions.includes('editdash')
      ) {
        return true;
      }
      return false;
    },
    textareaEv: function () {
      let eventFull = this.$store.getters.getEventFull(this.idDash);
      if (eventFull != '') {
        this.textarea_event = eventFull;
      }
      return true;
    },
    tockens: function () {
      // получения всех токенов на страницы
      let tockens = this.$store.getters.getTockens(this.idDash);

      tockens.forEach(item => {
        this.tockensName[item.name] = item.name;
        this.lookTockens.push({ show: false, color: this.theme.controls });
      });
      return tockens;
    },
    elements: function () {
      // получение всех элемнета на странице
      return this.$store.getters.getElements(this.idDash);
    },
    actions: function () {
      // получение всех событий элемента на странице
      return function (element) {
        let names = this.$store.getters
          .getActions({ elem: element, idDash: this.idDash })
          .map(item => {
            return item.name;
          });
        return names;
      };
    },
    capture: function () {
      // получение всех подсобытий элемента на странице (события второго уровня )
      return function (element) {
        let capture = this.$store.getters.getCapture({
          elem: element.elem,
          action: element.action,
          idDash: this.idDash,
        });
        return capture;
      };
    },
  },
  mounted() {
    this.getCookie();
    this.tools = settings.tools;

    document.onmouseup = event => {
      // а при отпускании кнопки при перетаскивании
      document.onmousemove = null; // мы бросаем элемент где он есть
      let width = document.querySelector('#app').clientWidth;

      if (this.avatar) {
        let height = document.querySelector('.opentool').clientHeight;
        if (event.x > width - 450 && event.y < height) {
          this.avatar.remove(); // удаляем аватар из дерева dom
          this.avatar = null; // и у нас тоже его очищаем
        } else {
          this.addDashBoard();
          this.opentool = false;
          this.tool_elem = false;
        }
      }
    };
    let eventFull = this.$store.getters.getEventFull(this.idDash);
    if (eventFull != '') {
      this.textarea_event = eventFull;
    }
    if (document.querySelector('.block-code')) {
      document.querySelector('.block-code').style.maxHeight = `${
        document.querySelector('#content').clientHeight - 100
      }px`;
    }

    this.colorGear = 'controls';
    this.colorExim = 'controls';
    // this.fieldsets = document.querySelectorAll('fieldset');
    // this.changeColor();
  },
  methods: {
    exit: function () {
      document.cookie = `eva-dashPage=''; max-age=0 ; path=/`;
      document.cookie = `eva_token=''; max-age=0 ; path=/`;
      this.$store.commit('clearState');
      this.$router.push(`/`);
    },
    openThemeModal() {
      this.paleteShow = !this.paleteShow;
    },
    openLogs: function () {
      this.modalActive = true;
      this.$store.commit('setErrorLogs', false);
    },
    toBackward: function () {
      this.$router.go(-1);
    },
    edit: function () {
      this.$router.push(`/profile`);
    },
    setEditMode: function () {
      this.editMode = !this.editMode;
      this.$emit('changeMode');
    },
    cancelModal: function () {
      this.activeModal = false;
      this.modalPaper = false;
    },
    openSchedule: function (id) {
      this.scheduleSid = id;
      this.activeSchedule = true;
    },
    getCookie: async function () {
      if (this.$jwt.hasToken()) {
        this.login = this.$jwt.decode().username;

        let response = await fetch(`/api/user/permissions`).catch(error => {
          console.log(error);
          return {
            status: 300,
            result: 'Post не создался, возможно из-за неточностей в запросе',
          };
        });
        if (response.status === 200) {
          // если получилось
          await response.json().then(res => {
            // переводим полученные данные из json в нормальный объект
            this.userPermissions = res.data;

          });
        } else {
          this.exit();
        }
      } else {
        this.$router.push(`/`);
      }
    },
    openEdit: function (id) {
      // окно с редактированием search
      this.openSearch(); // то открываем его

      if (!this.change[id]) {
        // я так понимаю если на странице есть созданные ИС
        Object.keys(this.change).forEach(item => {
          // то пробегаемся по всем ИС
          item == id ? (this.change[item] = true) : (this.change[item] = false); // если нашли выбронный ИС то меняем его статус
        });
        let search = this.searches.filter(item => {
          // получаем только тот ИС который редактируется
          return item.sid == id;
        })[0];
        // отстутствие отступов сделано специально  чтобы красивее смотрелось на фронте
        this.newSearch = Object.assign({}, search);
        this.activeModal = true;
        this.createSearchBtn = 'edit';
      } else {
        // а если ИС нету
        this.openSearch(); //  то закрываем окно редактирования
      }
    },
    // возможно стоит переделать под цикл или типа того. ПОДУМАТЬ НАД ЭТИМ!
    openProfile: function () {
      // дальше будут фукнции отвечающие за переключение между разными инструментами, суть проста, если один открыт закрываем все остальные
      this.profile_elem = !this.profile_elem;
      this.openfilter = false;
      this.opentool = false;
      this.tool_elem = false;
      this.tocken_elem = false;
      this.opentocken = false;
      this.opencode = false;
      this.search_elem = false;
      this.code_elem = false;
      this.openevent = false;
      this.$emit('openProfile', this.profile_elem);
    },
    openSave: function () {
      // дальше будут фукнции отвечающие за переключение между разными инструментами, суть проста, если один открыт закрываем все остальные
      this.errorSave = false;
      this.save_elem = !this.save_elem;
      this.opensave = !this.opensave;
      this.openfilter = false;
      this.opentool = false;
      this.tool_elem = false;
      this.tocken_elem = false;
      this.opentocken = false;
      this.opencode = false;
      this.search_elem = false;
      this.code_elem = false;
      this.openevent = false;
    },
    openSearchCode: function () {
      this.search_elem = !this.search_elem;
      this.opencode = !this.opencode;
      this.openfilter = false;
      this.save_elem = false;
      this.opensave = false;
      this.opentool = false;
      this.tool_elem = false;
      this.tocken_elem = false;
      this.opentocken = false;
      this.code_elem = false;
      this.openevent = false;
    },
    openToolPanel: function () {
      this.tool_elem = !this.tool_elem;
      this.opentool = !this.opentool;
      this.openfilter = false;
      this.save_elem = false;
      this.opensave = false;
      this.opencode = false;
      this.search_elem = false;
      this.tocken_elem = false;
      this.opentocken = false;
      this.code_elem = false;
      this.openevent = false;
    },
    openFilterPanel: function () {
      this.openfilter = !this.openfilter;
      this.opentool = false;
      this.tool_elem = false;
      this.save_elem = false;
      this.opensave = false;
      this.opencode = false;
      this.search_elem = false;
      this.tocken_elem = false;
      this.opentocken = false;
      this.code_elem = false;
      this.openevent = false;
    },
    openTockenCode: function () {
      this.tocken_elem = !this.tocken_elem;
      this.opentocken = !this.opentocken;
      this.openfilter = false;
      this.save_elem = false;
      this.opensave = false;
      this.opentool = false;
      this.tool_elem = false;
      this.opencode = false;
      this.search_elem = false;
      this.code_elem = false;
      this.openevent = false;
    },
    openEventCode: function () {
      this.code_elem = !this.code_elem;
      this.openevent = !this.openevent;
      this.openfilter = false;
      this.save_elem = false;
      this.opensave = false;
      this.opentool = false;
      this.tool_elem = false;
      this.opencode = false;
      this.search_elem = false;
      this.tocken_elem = false;
      this.opentocken = false;
    },
    openSearch: function () {
      // собственно функция которая показывает или нет окно с редактируемым ИД
      this.opensearch = !this.opensearch;
      Object.keys(this.change).forEach(item => {
        this.change[item] = false;
      });
    },
    openModal: function () {
      this.activeModal = !this.activeModal;
      this.newSearch = {
        sid: null,
        original_otl: null,
        parametrs: {
          tws: 0,
          twf: 0,
          username: 'admin',
          timeout: 60,
          preview: false,
          field_extraction: false,
          cache_ttl: 60,
        },
      };
      this.createSearchBtn = 'create';
    },
    lookTocken: function (i) {
      if (!this.lookTockens[i].show) {
        this.lookTockens[i].show = true;
        this.lookTockens[i].color = this.theme.controlsActive;
      } else {
        this.lookTockens[i].show = false;
        this.lookTockens[i].color = this.theme.controls;
      }
    },
    saveTocken: function () {
      // функция которая сохраняет токен в хранилище

      let parent = event.target.parentElement; // получаем предка элемнета на который нажали для сохранения
      while (!parent.classList.contains('row-tocken')) {
        parent = parent.parentElement; // то еще на уровень выше берем предка
      }
      this.tempTocken = {
        // создаем объект нашего сохраняемого токена считывая имя элемент и остальные поля из нужно строки
        name: parent.querySelector('.tocken-name').querySelector('input')
          ? parent.querySelector('.tocken-name').querySelector('input').value
          : '',
        elem: parent.querySelector('.tocken-elem').querySelector('.v-select__selection')
          ? parent.querySelector('.tocken-elem').querySelector('.v-select__selection').innerText
          : '',
        action: parent.querySelector('.tocken-action').querySelector('.v-select__selection')
          ? parent.querySelector('.tocken-action').querySelector('.v-select__selection').innerText
          : '',
        capture: parent.querySelector('.tocken-capture').querySelector('.v-select__selection')
          ? parent.querySelector('.tocken-capture').querySelector('.v-select__selection')
              .innerText
          : '',
        prefix: parent.querySelector('.tocken-prefix').querySelector('input')
          ? parent.querySelector('.tocken-prefix').querySelector('input').value
          : '',
        sufix: parent.querySelector('.tocken-sufix').querySelector('input')
          ? parent.querySelector('.tocken-sufix').querySelector('input').value
          : '',
        delimetr: parent.querySelector('.tocken-delimetr').querySelector('input')
          ? parent.querySelector('.tocken-delimetr').querySelector('input').value
          : '',
        defaultValue: parent.querySelector('.tocken-default-value').querySelector('input')
            ? parent.querySelector('.tocken-default-value').querySelector('input').value
            : '',
        resetData: true, //сделать норм
      };

      let j = -1;

      this.tockens.forEach((item, i) => {
        // затем пробегаемся по все мтокенам
        if (item.name == this.tempTocken.name) {
          // и смотрим есть ли у нас такой токен
          j = i;
        }
      });
      if (j != -1) {
        // если токен уже есть
        let height = this.$el.querySelector('.block-tocken').getBoundingClientRect().height; // выводим предупреждающее сообщение, переписать ли его
        this.$el.querySelector('.warning-block').classList.add('warning-block-show');
        //this.$el.querySelector('.warning-block').style.bottom = `-${height+55}px; !important`; // 45 это высота самого warning и padding сверху
        this.otstupBottom = height + 55;
        this.msgWarn = 'Такой токен уже существует. Хотите обновить?';
        this.$el
          .querySelector('.warning-block')
          .querySelector('.yes-btn')
          .setAttribute('tool', 'tocken');
      } else {
        // если нету то етсь он новый
        this.$store.commit('createTockens', { idDash: this.idDash, tocken: this.tempTocken }); // то создаем токен в хранилище
        this.showSign = true; // визуально скрываем окно с созданием токена
        this.opennewtocken = false;
      }
    },
    deleteTocken: function (name) {
      // удаляем токен
      this.$store.commit('setModalDelete', {
        id: this.idDash,
        status: true,
        elem: '',
        name: name,
        page: 'tocken',
      }); // просто отправляем информацию об удаляемом токене в хранилище
    },
    deleteSearch: function (id) {
      // тоже саоме для удаления ИС
      this.$store.commit('setModalDelete', {
        id: this.idDash,
        status: true,
        elem: id,
        name: id,
        page: 'search',
      });
    },
    runAllSearches() {
      this.searches.forEach((search) => {
        this.$store.commit('updateSearchStatus', {
          idDash: this.idDash,
          sid: search.sid,
          status: 'empty',
        })
      })
    },
    startSearch: async function (search) {
      this.$store.commit('updateSearchStatus', {
        idDash: this.idDash,
        sid: search.sid,
        status: 'empty',
      })
    },
    yesSearch: function () {
      // кнопка согласия на обновления если ИС или токен уже существует
      let elem =
        event.target.nodeName.toLowerCase() != 'button'
          ? event.target.parentElement
          : event.target; // сперва берем родителя кнопки, и если не получилось поймать кнопку, то еще выше уровнеь берем
      if (elem.getAttribute('tool') == 'search') {
        // если это окно ИС
        this.$store.commit('setSearch', {
          search: this.newSearch,
          idDash: this.idDash,
          reload: true,
        }); // то обновляем ИС
        this.$el.querySelector('.warning-block').classList.remove('warning-block-show'); // убираем окно с предпреждением
        this.openSearch();
      } else if (elem.getAttribute('tool') == 'tocken') {
        // если это токен - собственно тоже самое
        this.$store.commit('createTockens', { idDash: this.idDash, tocken: this.tempTocken });
        this.$el.querySelector('.warning-block').classList.remove('warning-block-show');
        this.showSign = true;
        this.opennewtocken = false;
      }
    },
    noSearch: function () {
      // если нажали на кнопку нет
      this.$el.querySelector('.warning-block').classList.remove('warning-block-show'); // то просто убираем это окно
    },
    checkSid: function (sid) {
      let newSid = sid;
      if (sid.length > 5) {
        // если там больше 10 символов
        newSid = sid.substring(0, 5) + '...'; // обрезаем и добовляем троеточие
      }
      return newSid;
    },
    openEditSearch: function (event, sid) {
      if (
        event.target.classList.contains('search-id') ||
        event.target.classList.contains('search-query')
      ) {
        this.openEdit(sid);
      }
    },
    exportSearch: function (sid) {
      this.$emit('downloadData', sid)
      // let db = null;
      //
      // let request = indexedDB.open('EVA', 1);
      //
      // request.onerror = function (event) {
      //   console.log('error: ', event);
      // };
      //
      // request.onupgradeneeded = event => {
      //   console.log('create');
      //   db = event.target.result;
      //   if (!db.objectStoreNames.contains('searches')) {
      //     // if there's no "books" store
      //     db.createObjectStore('searches'); // create it
      //   }
      //
      //   request.onsuccess = event => {
      //     db = request.result;
      //     console.log('successEvent: ' + db);
      //   };
      // };
      //
      // let promise = new Promise((resolve, reject) => {
      //   request.onsuccess = event => {
      //     db = request.result;
      //
      //     let transaction = db.transaction('searches'); // (1)
      //
      //     // получить хранилище объектов для работы с ним
      //     let searches = transaction.objectStore('searches'); // (2)
      //
      //     let query = searches.get(`${this.idDash}-${sid}`); // (3) return store.get('Ire Aderinokun');
      //
      //     query.onsuccess = event => {
      //       // (4)
      //       resolve(query.result);
      //     };
      //
      //     query.onerror = function () {
      //       console.log('Ошибка', query.error);
      //     };
      //   };
      // });
      //
      // promise.then(res => {
      //   let csvContent = 'data:text/csv;charset=utf-8,'; // задаем кодировку csv файла
      //   let keys = Object.keys(res[0]); // получаем ключи для заголовков столбцов
      //   csvContent += encodeURIComponent(keys.join(',') + '\n'); // добавляем ключи в файл
      //   csvContent += encodeURIComponent(
      //     res.map(item => Object.values(item).join(',')).join('\n')
      //   ); // добовляем все значения по ключам в файл
      //   let link = this.$refs.blockCode.appendChild(document.createElement('a')); // создаем ссылку
      //   link.setAttribute('href', csvContent); // указываем ссылке что надо скачать наш файл csv
      //   link.setAttribute('download', `${this.idDash}-${sid}.csv`); // указываем имя файла
      //   link.click(); // жмем на скачку
      //   link.remove(); // удаляем ссылку
      // });
    },
    // checkDataSearch: async function (sid) {
    //   let response = await this.$store.getters.checkDataSearch(`${this.idDash}-${sid}`);
    //   if (response) {
    //     this.$set(this.disabledDS, sid, false);
    //   } else {
    //     this.$set(this.disabledDS, sid, true);
    //   }
    // },
    dragTool: function (event) {
      // функция для перетаскивания нового элемнета на полотно (остальную область, ну вы поняли короче)

      if (event.which != 1) {
        // если пошло что-то не так
        return; // то прекращаем функцию
      }
      let parent = '';
      let elem = '';
      if (event.target.nodeName != 'div') {
        // если мы ухватились не за div
        elem = event.target;
        while (!elem.classList.contains('tool-one')) {
          // то ка кбы всплываем вверх пока не уткнемся в элемнет с классом tool-one
          elem = elem.parentElement;
        }
        parent = elem; // это будет наш родитель
      } else {
        // а если мы сразу попали как надо
        parent = event.target.parentElement; // то присваиваем нужно нам родителя
      }

      let originCoord = parent.getBoundingClientRect(); // получаем координаты нашего элемента
      let shiftX = event.pageX - originCoord.left; // это как бы расстояния от точки куда тыкнул пользователь до краев элемнета, это нужно чтобы красиво перемещать
      let shiftY = event.pageY - (originCoord.top + pageYOffset);
      let avatar = parent.cloneNode(true); // дальше мы создаем как бы клон нашего элемнета
      document.body.appendChild(avatar); // и его уже добовляем в body
      avatar.classList.add('avatar'); // даем ему класс
      avatar.style.zIndex = 3; // делаем его выше всех
      avatar.style.position = 'absolute'; // и относительно позиионируем

      document.onmousemove = event => {
        // при движении мыши
        avatar.style.left = event.pageX - shiftX + 'px'; // мы перемещаем на самом деле наш автар, а не сам объект
        avatar.style.top = event.pageY - shiftY + 'px';
        this.avatar = avatar; // и храним объект нашего  аватара
      };
      document.onclick = event => {
        // при клике на элемент
        avatar.remove(); // удаляем аватар из дерева dom
      };
    },
    addDashBoard: function () {
      // функция создания нового элемнета
      if (this.avatar.nodeName) {
        // если автар существует а не потерялся по пути
        const top = Number(this.avatar.style.top.replace('px', ''))

        let coord = this.avatar.getBoundingClientRect(); // берем координаты аватара
        let type = this.avatar.getAttribute('data-type'); // и его тип (table, select and etc)
        this.avatar.remove(); // удаляем аватар из дерева dom
        this.avatar = null; // и у нас тоже его очищаем

        // Создаем новый элемнет на дашборде (стандартные настройки любого элемента)

        this.$set(this.newDashBoard, type, {});
        this.$set(
          this.newDashBoard[type],
          'name_elem',
          type[0].toUpperCase() + type.substring(1)
        );

        let step = JSON.parse(JSON.stringify(this.$store.getters.getSizeGrid(this.idDash)));
        step.vert = Math.round(screen.width / Number(step.vert));
        step.hor = Math.round(screen.height / Number(step.hor));

        let size = this.calcGrid(
          settings.size[type].height,
          settings.size[type].width,
          step,
          'size'
        );

        this.$set(this.newDashBoard[type], 'width', size.vert);
        this.$set(this.newDashBoard[type], 'height', size.hor);

        let pos = this.calcGrid(coord.top, coord.left, step, 'pos');
        this.$set(this.newDashBoard[type], 'top', top / this.horizontalCell);
        this.$set(this.newDashBoard[type], 'left', pos.vert);

        // this.$set(this.newDashBoard[type],'width',settings.size[type].width);
        // this.$set(this.newDashBoard[type],'height',settings.size[type].height);

        // let size ={top: coord.top, left: coord.left};
        // this.$set(this.newDashBoard[type],'top',size.top+pageYOffset);
        // this.$set(this.newDashBoard[type],'left',size.left);

        this.$set(this.newDashBoard[type], 'should', false);
        this.$set(this.newDashBoard[type], 'search', -1);
        this.$set(this.newDashBoard[type], 'switch', false);
        this.$set(this.newDashBoard[type], 'actions', []);
        this.$store.commit('createDashBoard', {
          idDash: this.idDash,
          dashboard: this.newDashBoard,
        }); // создаем новый элемнет

        this.newDashBoard = {};
      }
    },
    calcGrid: function (top, left, step, action) {
      let size = {},
        header;
      screen.width > 1400 ? (header = 50) : (header = 40);
      action == 'size' ? (header = 0) : false;
      size.vert = Math.round(left / step.vert);
      //size.vert = leftCoord*step.vert;
      size.hor = Math.round((top - header) / step.hor);
      //size.hor = (topCoord*step.hor)+header;
      return size;
    },
    // calcSizePx(size,key) {
    //   return `${((size*100)/screen[key]).toFixed(1)}%`
    // },
    checkPos: function (size) {
      let result = { top: 0, left: 0 };
      let clientWidth = document.querySelector('#app').clientWidth;
      size.top < 50 ? (result.top = 70) : (result.top = size.top);
      size.left < 0 ? (result.left = 20) : (result.left = size.left);
      if (size.left + size.width > clientWidth) {
        result.left = clientWidth - size.width - 20;
      } else {
        if (result.left == 0) {
          result.left = size.left;
        }
      }
      return result;
    },
    showModalExin: function (event) {
      // функция вызова модального окна импорта экспорта
      this.$store.commit('setModalExin', { idDash: this.idDash, status: true, event: event });
    },
    openSettings: function () {
      this.$emit('openSettings');

      if (this.colorGear == 'controlsActive') {
        this.colorGear = 'controls';
      } else {
        this.colorGear = 'controlsActive';
      }
    },
    openExim: function () {
      if (this.colorExim == 'controlsActive') {
        this.colorExim = 'controls';
      } else {
        this.colorExim = 'controlsActive';
      }
      this.openexim = !this.openexim;
    },
    setEvents: function () {
      if (this.textarea_event != null && this.textarea_event != '') {
        let events = this.textarea_event.split('\n');
        let reg, body, bodyArray, element, doing, originItem;

        if (events.length != 0) {
          events.forEach(item => {
            originItem = item;
            item = item.replace(/\s/g, '');
            if (item != '') {
              reg = new RegExp(/^[\s+]?[\w]+\(/, 'g');
              this.$set(this.event, 'event', reg.exec(item)[0].replace('(', ''));
              reg = new RegExp(/\(.+\)/, 'g');
              body = reg.exec(item)[0];
              body = body.slice(1, body.length - 1);
              bodyArray = body.split(',');
              bodyArray.forEach((elem, i) => {
                if (elem.indexOf('(') != -1) {
                  element = bodyArray.splice(0, i);
                }
              });

              if (this.event.event == 'OnDataCompare') {
                if (element.length > 2 && element[1].indexOf('[') == -1) {
                  this.$set(this.event, 'compare', element[0]);
                  this.$set(this.event, 'column', element[1]);
                  this.$set(this.event, 'row', element.splice(2, element.length - 1).join(','));
                } else {
                  this.$set(this.event, 'compare', element[0]);
                  this.$set(this.event, 'sense', element.splice(1, element.length - 1).join(','));
                }
              } else if (this.event.event == 'OnTokenCompare') {
                this.$set(this.event, 'compare', element[0]);
                this.$set(this.event, 'token', element[1]);
                this.$set(
                  this.event,
                  'tokenval',
                  element.splice(2, element.length - 1).join(',')
                );
              } else if (this.event.event == 'onValueCompare') {
                if (element.length == 2) {
                  this.$set(this.event, 'treshold', element[0]);
                  this.$set(this.event, 'color', element[1]);
                } else {
                  for (let i = 0; i < element.length; i++) {
                    if (element[i].indexOf(']') != -1) {
                      this.$set(this.event, 'treshold', element.slice(0, i + 1).join(','));
                      this.$set(
                        this.event,
                        'color',
                        element.slice(i + 1, element.length).join(',')
                      );
                      break;
                    }
                  }
                }
              } else {
                this.$set(this.event, 'element', element[0]); //click
                if (element[1]) {
                  if (element[1].indexOf('[') != -1) {
                    let j = -1;
                    element.forEach((item, i) => {
                      if (item.indexOf(']') != -1) {
                        j = i;
                      }
                    });
                    let partelement = element[1];
                    for (let i = 2; i < j + 1; i++) {
                      partelement += ',' + element[i];
                    }
                    this.$set(this.event, 'partelement', partelement);
                  } else {
                    this.$set(this.event, 'partelement', element[1]);
                  }
                } else {
                  this.$set(this.event, 'partelement', 'empty');
                }
              }
              reg = new RegExp(/\w+\(.+\)/, 'g');
              doing = reg.exec(body)[0];
              doing = doing.split('(');
              this.$set(this.event, 'action', doing[0]);
              if (doing[0].toLowerCase() == 'set'.toLowerCase()) {
                doing = doing[1].slice(0, doing[1].length - 1).split(',');

                this.$set(this.event, 'target', doing[0]);
                doing.splice(0, 1);
                doing = doing.join(',');
                if (doing.indexOf('[') != -1 && doing.indexOf(']') != -1) {
                  doing = doing.match(/[^\[]+(?=\])/g);
                } else {
                  doing = doing.split(',');
                }

                if (doing == null) {
                  this.$set(this.event, 'prop', ['']);
                  this.$set(this.event, 'value', ['']);
                } else {
                  this.$set(this.event, 'prop', doing[0].split(','));
                  if (doing[1]) {
                    this.$set(this.event, 'value', doing[1].split(','));
                  } else {
                    this.$set(this.event, 'value', ['']);
                  }
                }
              } else if (doing[0].toLowerCase() == 'go'.toLowerCase()) {
                ///go
                doing = doing[1].slice(0, doing[1].length - 1).split(',');
                this.$set(this.event, 'target', doing[0]);
                let prop, value;
                if (doing[1].indexOf('[') != -1) {
                  doing.splice(0, 1);
                  doing = doing.join(',');
                  doing = doing.match(/[^\[]+(?=\])/g);
                  prop = doing[0].split(',');
                  value = doing[1].split(',');
                } else {
                  prop = [doing[1]];
                  value = [doing[2]];
                }
                this.$set(this.event, 'prop', prop);
                this.$set(this.event, 'value', value);
              } else if (doing[0].toLowerCase() == 'open'.toLowerCase()) {
                //open
                doing = doing[1].slice(0, doing[1].length - 1).split(',');

                this.$set(this.event, 'target', doing[0]);
                this.$set(this.event, 'prop', [doing[1]]);
                this.$set(this.event, 'value', [doing[2]]);

                this.$set(this.event, 'widthPersent', doing[3]);
                this.$set(this.event, 'heightPersent', doing[4]);

                this.$set(this.event, 'header', doing[5]);
              } else if (doing[0].toLowerCase() == 'changeReport'.toLowerCase()) {
                // changeReport

                doing = originItem.split(doing[0])[1];
                doing = doing.replace(/\(/g, '').replace(/\)/g, '').split(',');
                this.$set(this.event, 'sid', doing[0]);
                if (doing[1].indexOf('[') != -1) {
                  doing.splice(0, 1);
                  let files = doing.map(item => {
                    return item.replace('[', '').replace(']', '');
                  });
                  this.$set(this.event, 'file', files);
                } else {
                  this.$set(this.event, 'file', [doing[1]]);
                }
              } else if (doing[0].toLowerCase() == 'exportSearch'.toLowerCase()) {
                // changeReport

                doing = doing[1]
                  .replace(/\)/g, '')
                  .replace(/\[/g, '')
                  .replace(/\]/g, '')
                  .split(',');
                this.$set(this.event, 'searches', doing);
              }
              this.events.push(this.event);
              this.event = {};
            }
          });

          this.$store.commit('setEvents', {
            event: this.events,
            eventFull: this.textarea_event,
            idDash: this.idDash,
          });

          this.events = [];

          this.openEventCode();
        }
      } else {
        this.$store.commit('setEvents', { event: null, eventFull: null, idDash: this.idDash });

        this.events = [];

        this.openEventCode();
      }
    },

    changeColor: function () {
      if (document.querySelectorAll('.v-menu__content').length != 0) {
        document.querySelectorAll('.v-menu__content').forEach(item => {
          item.style.boxShadow = `0 5px 5px -3px ${this.theme.border},0 8px 10px 1px ${this.theme.border},0 3px 14px 2px ${this.theme.border}`;
          item.style.background = this.theme.back;
          item.style.color = this.theme.text;
          item.style.border = `1px solid ${this.theme.border}`;
        });
      }
    },
    saveDash: function () {
      let dash = this.$store.getters.getDashboard(this.idDash);
      let response = this.$store.getters.saveDashboard({
        id: this.idDash,
        body: JSON.stringify(dash),
      });
      response.then(res => {
        this.errorSave = true;
        if (res.status == 200) {
          this.colorErrorSave = this.theme.controls;
          this.msgErrorSave = 'Дашборд сохранен';
          this.$store.auth.getters.putLog(
            `Сохранен дашборд  ${this.toHichName(res.data.name)} c id ${res.data.id}`
          );
          // console.log(res.data)
          this.updateDash({ data: res.data, dash: dash });
        } else {
          this.colorErrorSave = this.theme.controlsActive;
          this.msgErrorSave = 'Не получилось. Попробуйте еще раз.';
        }
        setTimeout(() => {
          this.save_elem = false;
          this.opensave = false;
        }, 2000);
      });
    },
    updateDash: function (dash) {
      this.$store.commit('updateDash', {
        dash: { body: JSON.stringify(dash.dash), id: this.idDash },
        modified: dash.data.modified,
      });
      this.$store.auth.getters.putLog(
        `Обновлен дашборд ${this.toHichName(dash.data.name)} с id ${this.idDash}`
      );
    },
    toHichName: function (name) {
      return name[0].toUpperCase() + name.slice(1);
    },
    toHome: function () {
      this.$router.push(`/main`);
    },
  },
};
</script>

<style lang="scss">
@import '../sass/dashPanelBoard.sass';
</style>

<style>
.iconsNavigations {
  display: flex;
  justify-content: center;
  flex-direction: row;
}
</style>
