<template>
  <div class="app-header">
    <div
      class="dash-main"
      :style="{ background: theme.$main_bg }"
    >
      <div class="main-title">
        <div class="logo-block">
          <EvaLogo />
        </div>
        <div
          class="title-name"
          :style="{ color: theme.$title }"
        >
          {{ name }}
        </div>
        <v-tooltip
          bottom
          :color="theme.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <v-icon
              class="home"
              :color="theme.$secondary_text"
              v-on="on"
              @click="openNavPanel"
            >
              {{ iconTree }}
            </v-icon>
          </template>
          <span>Дерево</span>
        </v-tooltip>
        <v-tooltip
          bottom
          :color="theme.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <router-link
              to="/main"
              v-on="on"
            >
              <v-icon
                class="home"
                :color="theme.$secondary_text"
                v-on="on"
              >
                {{ home }}
              </v-icon>
            </router-link>
          </template>
          <span>На главную</span>
        </v-tooltip>
        <v-tooltip
          bottom
          :color="theme.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <v-icon
              class="undo mr-4"
              :color="theme.$secondary_text"
              v-on="on"
              @click="toBackward"
            >
              {{ undo }}
            </v-icon>
          </template>
          <span>Назад</span>
        </v-tooltip>
      </div>
      <div class="control-block">
        <div
          class="edit-container"
          :class="{ hide_control: !editMode }"
        >
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
          >
            <template v-slot:activator="{ on }">
              <v-icon
                class="control-button theme--dark"
                :style="{ color: theme.$secondary_text }"
                v-on="on"
                @click="loadSvg = !loadSvg"
              >
                {{ upload_icon }}
              </v-icon>
            </template>
            <span>Загрузка файла</span>
          </v-tooltip>
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
          >
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
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
          >
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
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
          >
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
            <span>Источники данных</span>
          </v-tooltip>
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
          >
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
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
          >
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
          <v-tooltip
            v-if="editPermission || isEditDash"
            bottom
            :color="theme.$accent_ui_color"
          >
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
          <v-tooltip
            v-if="editPermission || isEditDash"
            bottom
            :color="theme.$accent_ui_color"
          >
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
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
          >
            <template v-slot:activator="{ on }">
              <v-icon
                class="control-button theme--dark"
                :color="
                  getColorError ? theme.$primary_button : theme.$secondary_text
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
        <v-menu
          :nudge-width="100"
          :rounded="false"
          offset-y
        >
          <template v-slot:activator="{ on: onMenu }">
            <v-tooltip
              bottom
              :color="theme.$accent_ui_color"
            >
              <template v-slot:activator="{ on: onTooltip }">
                <div
                  class="dropdown-profile"
                  v-on="{ ...onMenu, ...onTooltip }"
                >
                  <v-icon
                    :style="{ color: theme.$secondary_text }"
                    class="profile theme--dark"
                  >
                    {{ profile_icon }}
                  </v-icon>
                  <div
                    class="id-user profile-login"
                    :style="{ color: theme.$secondary_text }"
                  >
                    {{ login }}
                  </div>
                </div>
              </template>
              <span>Меню профиля</span>
            </v-tooltip>
          </template>
          <v-list class="profile-dropdown--list">
            <v-list-item>
              <v-list-item-title class="profile-dropdown--title">
                Профиль
              </v-list-item-title>
            </v-list-item>
            <div
              v-for="item in profileDropdownButtons"
              :key="item.id"
            >
              <v-list-item v-if="!item.hide">
                <v-btn
                  class="profile-dropdown--button"
                  icon
                  v-on="on"
                  @click="item.onClick"
                >
                  <v-icon
                    class="edit icon-aut"
                    :color="theme.$secondary_text"
                  >
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
        :style="blockToolStyle"
      >
        <div class="iconsNavigations">
          <v-icon
            :color="theme.$primary_button"
            @click="runAllSearches"
          >
            {{ mdiAnimationPlay }}
          </v-icon>
          <v-icon
            :color="theme.$primary_button"
            @click="openModal"
          >
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
              width: '65px',
            }"
            :title="search.sid"
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
              :class="{
                loading:
                  search.status === 'pending' && search.original_otl !== null,
              }"
            />
          </div>
          <v-tooltip
            z-index="99"
            bottom
            :color="theme.$accent_ui_color"
          >
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
          <v-tooltip
            z-index="99"
            bottom
            :color="theme.$accent_ui_color"
          >
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
          <v-tooltip
            z-index="99"
            bottom
            :color="theme.$accent_ui_color"
          >
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
          <v-tooltip
            z-index="99"
            bottom
            :color="theme.$accent_ui_color"
          >
            <template v-slot:activator="{ on }">
              <v-icon
                class="search-clock"
                :color="theme.$primary_button"
                :disabled="search.status !== 'downloaded'"
                v-on="on"
                @click="exportSearch(search.id)"
              >
                {{ download }}
              </v-icon>
            </template>
            <span>Экспортировать ИД</span>
          </v-tooltip>
          <v-tooltip
            bottom
            z-index="99"
            :color="theme.$accent_ui_color"
          >
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
        <v-btn
          small
          class="create-search"
          :color="theme.$primary_button"
          @click="openModal"
        >
          Создать
        </v-btn>
      </div>
      <v-row
        class="block-tool"
        :class="{ opentool: opentool }"
        :style="blockToolStyle"
      >
        <v-col
          v-for="tool in tools"
          :key="tool.name"
          cols="6"
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
            <v-icon
              class="tool-img-itself"
              :style="{ color: '#FFF' }"
            >
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
        </v-col>
      </v-row>
      <div
        ref="blockTocken"
        class="block-tocken"
        :class="{ opentocken: opentocken }"
        :style="blockToolStyle"
      >
        <div
          v-for="(tocken, i) in tokens"
          :key="tocken.name"
          class="row-tocken"
          :style="{ color: theme.$main_text }"
        >
          <div
            class="row-data row-itself"
            :class="{ showTocken: !lookTockens[i].show }"
          >
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
              :attach="true"
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
              :attach="true"
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
              :attach="true"
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
            <v-checkbox
              v-model="tocken.onButton"
              label="обновлять по кнопке"
              class="tocken-on-button theme--dark"
              :color="theme.$accent_ui_color"
            />
          </div>
          <p
            class="tocken-view"
            :class="{ showView: lookTockens[i].show }"
            :color="theme.$main_text"
          >
            <span class="backlight-tkn">{{ tocken.value }}</span>
          </p>
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
            style="z-index: 100"
          >
            <template v-slot:activator="{ on }">
              <v-icon
                class="row-check"
                :color="theme.$primary_button"
                :class="{ showIcon: lookTockens[i].show }"
                v-on="on"
                @click="saveTocken(i)"
              >
                {{ check }}
              </v-icon>
            </template>
            <span>Создать/обновить токен</span>
          </v-tooltip>
          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
            style="z-index: 100"
          >
            <template v-slot:activator="{ on }">
              <v-icon
                class="row-look"
                :color="theme.$primary_button"
                v-on="on"
                @click="lookTocken(i)"
              >
                {{ look }}
              </v-icon>
            </template>
            <span>Предпросмотр токена</span>
          </v-tooltip>

          <v-tooltip
            bottom
            :color="theme.$accent_ui_color"
            style="z-index: 100"
          >
            <template v-slot:activator="{ on }">
              <v-icon
                class="row-trash"
                :color="theme.$primary_button"
                :class="{ showIcon: lookTockens[i].show }"
                @click="deleteTocken(tocken.name, i)"
                v-on="on"
              >
                {{ trash }}
              </v-icon>
            </template>
            <span>Удалить токен</span>
          </v-tooltip>
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
            :items="elementsOnPage"
            :color="theme.$main_text"
            :attach="true"
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
            :attach="true"
            hide-details
            outlined
            class="tocken-action theme--dark"
            label="Действие"
            @click="changeColor"
          />
          <v-select
            v-model="newCapture"
            :items="capture({ action: newAction, elem: newElem })"
            :color="theme.$main_text"
            :attach="true"
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
          <v-checkbox
            v-model="newTockenDop.onButton"
            label="обновлять по кнопке"
            class="tocken-on-button theme--dark"
            :color="theme.$accent_ui_color"
          />

          <v-icon
            class="row-check"
            :color="theme.$primary_button"
            @click="saveTocken()"
          >
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
          :text-area-full="textareaEv"
          :color="theme.$main_text"
          :style="{ color: theme.$main_text }"
          auto-grow
          outlined
          class="textarea-event textarea-scroll"
          label="Начните писать событие"
          hide-details
          clearable
        />
        <v-btn
          class="event-btn"
          :color="theme.$primary_button"
          @click="setEvents"
        >
          Подтвердить
        </v-btn>
      </div>
      <div
        class="block-save"
        :class="{ opensave: opensave }"
        :style="{
          background: theme.$main_bg,
          border: `1px solid ${theme.$main_text}`,
        }"
      >
        <div
          v-show="!errorSave"
          class="save-obertka"
        >
          <div
            class="question-save"
            :style="{ color: theme.$main_text }"
          >
            Сохранить дашборд
            <span class="save-name">
              {{ name }}
            </span>
            ?
          </div>
          <div class="buttons-save">
            <v-btn
              class="save-btn my-2"
              small
              :color="theme.$primary_button"
              @click="saveDash"
            >
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
        <div
          v-show="errorSave"
          class="save-obertka message-save"
        >
          <div
            class="question-save"
            :style="{ color: theme.$error_color }"
          >
            {{ msgErrorSave }}
          </div>
        </div>
      </div>
      <div
        class="warning-block"
        :class="{ openwarning: openwarning, errorSaveToken: errorSaveToken }"
        :style="{
          background: theme.$main_bg,
          bottom: `-${otstupBottom}px`,
        }"
      >
        <div class="warning-text">
          {{ msgWarn }}
        </div>
        <div
          v-show="!errorSaveToken"
          class="btn-warning"
        >
          <v-btn
            small
            :color="theme.$primary_button"
            class="warning-btn yes-btn"
            @click="yesSearch"
          >
            Да
          </v-btn>
          <v-btn
            small
            :color="theme.$primary_button"
            class="warning-btn"
            @click="noSearch"
          >
            Нет
          </v-btn>
        </div>
      </div>
      <modal-create-search
        v-model="activeModal"
        :id-dash-from="idDash"
        :create-btn-from="createSearchBtn"
        :data-search-from="newSearch"
        @cancelModal="cancelModal"
      />
      <modal-themes
        v-model="paleteShow"
        :admin="isAdmin"
      />
      <modal-schedule
        v-model="activeSchedule"
        :id-dash-from="idDash"
        :color-from="theme"
        :data-sid-from="scheduleSid"
      />
      <modal-log v-model="modalActive" />
      <dash-settings
        :gear-from="gearShow"
        :permissions-from="permissions"
        :id-dash-from="idDashFrom"
      />
      <modal-loading-svg
        v-model="loadSvg"
        @updateModalValue="loadSvg = false"
      />
    </div>

    <div
      class="block-filter"
      :class="{ openfilter }"
    >
      <dash-filter-panel
        :permissions-from="permissions"
        :id-dash-from="idDashFrom"
        :edit-permission="editPermission || isEditDash"
        :edit-mode="editMode"
      />
    </div>
    <notifications />
  </div>
</template>

<script>
import {
  mdiAccount,
  mdiAccountEdit,
  mdiAnimationPlay,
  mdiArrowDownBold,
  mdiCheckBold,
  mdiClockOutline,
  mdiCodeTags,
  mdiCompare,
  mdiContentSave,
  mdiDatabase,
  mdiDoor,
  mdiEye,
  mdiFilter,
  mdiHelpCircleOutline,
  mdiHomeVariantOutline,
  mdiMinusBox,
  mdiPencil,
  mdiPlay,
  mdiPlusBox,
  mdiScriptTextOutline,
  mdiSettings,
  mdiSwapVerticalBold,
  mdiTableEdit,
  mdiToolbox,
  mdiTrashCanOutline,
  mdiUndoVariant,
  mdiVariable,
  mdiFileTree,
  mdiCloudUpload,
} from '@mdi/js';
import { mapGetters } from 'vuex';
import EvaLogo from '../images/eva-logo.svg';
import settings from '../js/componentsSettings';
import DashFilterPanel from './dash-filter-panel/DashFilterPanel.vue';
import { globalTockens } from '../constants/globalTockens';
import Notifications from '@/components/notifications';

export default {
  name: 'DashPanelBoard',
  components: {
    Notifications,
    EvaLogo,
    DashFilterPanel,
  },
  props: {
    idDashFrom: {
      type: String,
      required: true,
    },
    inside: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      index: '',
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
      upload_icon: mdiCloudUpload,
      pencil: mdiPencil,
      play: mdiPlay,
      clock: mdiClockOutline,
      download: mdiArrowDownBold,
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
      openwarning: false,
      openexim: false,
      sign: true,
      gearShow: false,
      gear: mdiSettings,
      filterIcon: mdiFilter,
      exim: mdiSwapVerticalBold,
      home: mdiHomeVariantOutline,
      logIcon: mdiScriptTextOutline,
      iconTree: mdiFileTree,
      openhelp: false,
      newDashBoard: {},
      lookTockens: [],
      tools: [],
      avatar: null,
      mdiCompare,
      tempTocken: {},
      change: {},
      onButton: {},
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
        defaultValue: '*',
      },
      newElem: '',
      newAction: '',
      newCapture: '',
      tockensName: {},
      msgWarn: '',
      textarea_event: '',
      events: [],
      event: {},
      newSearch: {
        sid: null,
        original_otl: null,
        limit: 1000,
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
      errorSaveToken: false,
      disabledDS: {},
      screenHeight: this.getScreenHeight(),
      allGroups: [],
      tokens: [],
      loadSvg: false,
    };
  },
  computed: {
    ...mapGetters('auth', [
      'isAdmin',
      'permissions',
    ]),
    editMode() {
      return this.dashFromStore?.editMode;
    },
    getColorError() {
      if (!this.$store.state.logError) {
        this.$store.commit('setState', [
          {
            object: this.$store.state,
            prop: 'logError',
            value: false,
          },
        ]);
      }
      return this.$store.state.logError;
    },
    idDash() {
      return this.idDashFrom;
    },
    headerTop() {
      return document.body.clientWidth <= 1400 ? 40 : 50;
    },
    searches() {
      // массив со всеми ИС на странице
      let searchesRes = [];
      if (this.idDash) {
        // const searches = this.$store.dispatch('getSearches', this.idDash);
        const { searches } = this.$store.state[this.idDash];
        if (searches) {
          searches.forEach((item) => {
            this.$set(this.change, item.sid, false);
          });
          searchesRes = searches;
        }
      }
      return searchesRes;
    },
    name() {
      return this.$store.state[this.idDash].name;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    editPermission() {
      return (
        this.isAdmin
        || this.permissions.includes('editdash')
      );
    },
    getEventFull() {
      if (this.dashFromStore.eventFull) {
        return this.dashFromStore.eventFull;
      }
      return '';
    },
    textareaEv() {
      const eventFull = this.getEventFull;
      if (eventFull !== '') {
        this.setTextAreaEvent(eventFull);
      }
      return true;
    },
    elementsOnPage() {
      if (this.$store.state[this.idDash]?.elements) {
        return this.$store.state[this.idDash].elements.filter(
          (elem) => this.$store.state[this.idDash][elem].tab
              === this.$store.state[this.idDash].currentTab
            || this.$store.state[this.idDash][elem].options?.pinned,
        );
      }
      return [];
    },
    elements() {
      // получение всех элемнета на странице
      return this.$store.state[this.idDash]?.elements || [];
    },
    actions() {
      // получение всех событий элемента на странице
      return (element) => {
        if (this.$store.state[this.idDash][element]) {
          return this.$store.state[this.idDash][element].actions.map(
            (item) => item.name,
          );
        }
        return [];
      };
    },
    capture() {
      // получение всех подсобытий элемента на странице (события второго уровня )
      return ({ elem, action }) => {
        if (this.dashFromStore && this.dashFromStore[elem]) {
          let j = Object.keys(this.dashFromStore[elem].actions).find(
            (key) => this.dashFromStore[elem].actions[key].name === action,
          );
          Object.keys(this.dashFromStore[elem].actions).forEach((item) => {
            if (this.dashFromStore[elem].actions[item].name === action) {
              j = item;
            }
          });
          if (j) {
            return this.dashFromStore[elem].actions[j].capture;
          }
          return [];
        }
        return [];
      };
    },
    blockToolStyle() {
      return {
        background: this.theme.$main_bg,
        color: this.theme.$main_text,
        'max-height': `${this.screenHeight - 50}px`,
      };
    },
    isEditDash() {
      return !!this.allGroups?.find(
        (group) => group.dashs.includes(this.name) && group.users.includes(this.login),
      );
    },
    dashFromStore() {
      return this.$store.state[this.idDash];
    },
    tokensFromStore() {
      return this.dashFromStore.tockens || [];
    },
    getSizeGrid() {
      if (!this.dashFromStore?.grid) {
        this.$store.commit('setState', [
          {
            object: this.dashFromStore,
            prop: 'grid',
            value: {},
          },
        ]);
        this.$store.commit('setState', [
          {
            object: this.dashFromStore.grid,
            prop: 'vert',
            value: '32',
          },
          {
            object: this.dashFromStore.grid,
            prop: 'hor',
            value: '18',
          },
        ]);
      }
      return this.dashFromStore?.grid;
    },
  },
  watch: {
    tokensFromStore: {
      deep: true,
      handler(value) {
        this.tokens = JSON.parse(JSON.stringify(value));
      },
    },
  },
  created() {
    this.uploadTokens();
  },
  mounted() {
    this.$store.commit('app/setOpenTree', false);
    this.getCookie();
    this.getGroups();
    this.tools = settings.tools;

    document.onmouseup = (event) => {
      // а при отпускании кнопки при перетаскивании
      document.onmousemove = null; // мы бросаем элемент где он есть
      const width = document.querySelector('#app').clientWidth;

      if (this.avatar) {
        const height = document.querySelector('.opentool').clientHeight;
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
    const eventFull = this.getEventFull;
    if (eventFull !== '') {
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

    window.addEventListener('resize', this.updateScreenHeight);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateScreenHeight);
  },
  methods: {
    getGroups() {
      this.$store.dispatch('getGroups').then((res) => {
        this.allGroups = res;
      });
    },
    exit() {
      this.$store.dispatch('auth/logout');
      this.$store.dispatch('app/resetState');
      this.$root.$emit('setDocumentTitle', null);
    },
    openThemeModal() {
      this.paleteShow = !this.paleteShow;
    },
    openLogs() {
      this.modalActive = true;
      this.$store.commit('setErrorLogs', false);
    },
    toBackward() {
      this.$router.go(-1);
    },
    edit() {
      this.$router.push('/profile');
    },
    setEditMode() {
      this.editMode = !this.editMode;
      this.$emit('changeMode');
    },
    setTextAreaEvent(eventFull) {
      this.textarea_event = eventFull;
    },
    cancelModal() {
      this.activeModal = false;
    },
    openSchedule(id) {
      this.scheduleSid = id;
      this.activeSchedule = true;
    },
    async getCookie() {
      if (this.$jwt.hasToken()) {
        this.login = this.$jwt.decode().username;

        const response = await fetch('/api/user/permissions').catch((error) => {
          console.error(error);
          return {
            status: 300,
            result: 'Post не создался, возможно из-за неточностей в запросе',
          };
        });
        if (response.status === 200) {
          // если получилось
          await response.json().then((res) => {
            // переводим полученные данные из json в нормальный объект
            this.$store.commit('auth/permissions', res.data);
          });
        } else {
          this.exit();
        }
      } else {
        await this.$router.push('/');
      }
    },
    // окно с редактированием search
    openEdit(id) {
      // то открываем его
      this.openSearch();

      // я так понимаю если на странице есть созданные ИС
      if (!this.change[id]) {
        // то пробегаемся по всем ИС
        Object.keys(this.change).forEach((item) => {
          // если нашли выбронный ИС то меняем его статус
          this.change[item] = item === id;
        });
        // получаем только тот ИС который редактируется
        // отстутствие отступов сделано специально  чтобы красивее смотрелось на фронте
        const search = this.searches.filter((item) => item.sid === id)[0];
        this.newSearch = { ...search };
        this.activeModal = true;
        this.createSearchBtn = 'edit';
        // а если ИС нету
      } else {
        //  то закрываем окно редактирования
        this.openSearch();
      }
    },
    // возможно стоит переделать под цикл или типа того. ПОДУМАТЬ НАД ЭТИМ!
    // дальше будут фукнции отвечающие за переключение между разными инструментами,
    // суть проста, если один открыт закрываем все остальные
    openProfile() {
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
    // дальше будут фукнции отвечающие за переключение между разными инструментами,
    // суть проста, если один открыт закрываем все остальные
    openSave() {
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
    openSearchCode() {
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
    openToolPanel() {
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
    openFilterPanel() {
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
    openTockenCode() {
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
    openEventCode() {
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
    // собственно функция которая показывает или нет окно с редактируемым ИД
    openSearch() {
      this.opensearch = !this.opensearch;
      Object.keys(this.change).forEach((item) => {
        this.change[item] = false;
      });
    },
    openModal() {
      this.activeModal = !this.activeModal;
      this.newSearch = {
        sid: null,
        original_otl: null,
        limit: 1000,
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
    lookTocken(i) {
      if (!this.lookTockens[i].show) {
        this.lookTockens[i].show = true;
        this.lookTockens[i].color = this.theme.controlsActive;
      } else {
        this.lookTockens[i].show = false;
        this.lookTockens[i].color = this.theme.controls;
      }
    },
    saveTocken(index) {
      // проверяем не пустой ли токен
      if (
        (this.newTockenName?.toLowerCase() === 'evatknlogin' && !Number.isInteger(index))
        || (Number.isInteger(index) && this.tockensName[this.tokens[index].name]?.toLowerCase() === 'evatknlogin')
      ) {
        this.errorSaveToken = true;
        this.openwarning = true;
        const height = this.$refs.blockTocken.clientHeight;

        this.otstupBottom = height + 55;
        this.msgWarn = 'Имя токена evaTknLogin системное.';

        setTimeout(() => {
          this.openwarning = false;
        }, 2000);
        return;
      }

      // проверяем не пустой ли токен
      if (
        (!this.newTockenName && !Number.isInteger(index))
        || (Number.isInteger(index)
          && !this.tockensName[this.tokens[index].name].length)
      ) {
        this.errorSaveToken = true;
        this.openwarning = true;
        const height = this.$refs.blockTocken.clientHeight;

        this.otstupBottom = height + 55;
        this.msgWarn = 'Имя токена пустое. Попробуйте еще раз.';

        setTimeout(() => {
          this.openwarning = false;
        }, 2000);
        return;
      }

      // проверяем на запретние названия
      if (
        (!Number.isInteger(index)
          && globalTockens.includes(this.newTockenName.trim()))
        || (Number.isInteger(index)
          && globalTockens.includes(
            this.tockensName[this.tokens[index].name].trim(),
          ))
      ) {
        this.errorSaveToken = true;
        this.openwarning = true;
        const height = this.$refs.blockTocken.clientHeight;

        this.otstupBottom = height + 55;
        this.msgWarn = 'Невозможно использовать это имя для токена. Попробуйте еще раз.';

        setTimeout(() => {
          this.openwarning = false;
        }, 2000);
        return;
      }
      // Проверяем на наличие корректного значения по-умолчанию для поля dash_id
      if (!this.checkDefaultValueToken(index)) {
        return;
      }

      // создаем объект нашего сохраняемого токена считывая имя элемент
      // и остальные поля из нужно строки
      if (Number.isInteger(index)) {
        // редактирование
        this.tempTocken = {
          name: this.tockensName[this.tokens[index].name],
          elem: this.tokens[index].elem,
          action: this.tokens[index].action,
          capture: this.tokens[index].capture,
          prefix: this.tokens[index].prefix,
          sufix: this.tokens[index].sufix,
          delimetr: this.tokens[index].delimetr,
          defaultValue: this.tokens[index].defaultValue,
          resetData: true, // сделать норм
          onButton: this.tokens[index].onButton,
        };
      } else {
        // создание нового
        this.tempTocken = {
          name: this.newTockenName,
          elem: this.newElem,
          action: this.newAction,
          capture: this.newCapture,
          prefix: this.newTockenDop.prefix,
          sufix: this.newTockenDop.sufix,
          delimetr: this.newTockenDop.delimetr,
          defaultValue: this.newTockenDop.defaultValue,
          resetData: true, // сделать норм
          onButton: this.newTockenDop.onButton,
        };
      }
      let j = -1;

      this.tokens.forEach((item, i) => {
        // затем пробегаемся по все мтокенам
        if (item.name === this.tempTocken.name) {
          // и смотрим есть ли у нас такой токен
          j = i;
        }
      });
      if (j !== -1 || Number.isInteger(index)) {
        // если токен уже есть
        this.openwarning = true; // выводим предупреждающее сообщение, переписать ли его
        this.errorSaveToken = false;

        const height = this.$refs.blockTocken.clientHeight;

        this.otstupBottom = height + 55;
        this.msgWarn = 'Такой токен уже существует. Хотите обновить?';

        this.index = j !== -1 ? j : index;
      } else {
        // если нету то етсь он новый
        this.$store.commit('createTockens', {
          idDash: this.idDash,
          tocken: this.tempTocken,
        }); // то создаем токен в хранилище
        this.showSign = true; // визуально скрываем окно с созданием токена
        this.opennewtocken = false;

        this.newTockenName = null;
        this.newElem = '';
        this.newAction = '';
        this.newCapture = '';
        this.newTockenDop = {
          defaultValue: '*',
        };
        this.uploadTokens();
      }
    },
    checkDefaultValueToken(index) {
      const token = {
        capture: this.tokens[index]?.capture || this.newCapture,
        element: this.tokens[index]?.element || this.newElem,
        defaultValue: this.tokens[index]?.defaultValue || this.newTockenDop.defaultValue,
      };
      if (
        token.capture === 'dash_id'
          && (token.element.indexOf('map') !== -1)
          && (!token.defaultValue || Number.isNaN(+token.defaultValue))
      ) {
        this.errorSaveToken = true;
        this.openwarning = true;
        const height = this.$refs.blockTocken.clientHeight;

        this.otstupBottom = height + 55;
        this.msgWarn = 'Некорректное значение по-умолчанию. Данное поле является обязательным при использовании свойства dash_id.';

        setTimeout(() => {
          this.openwarning = false;
        }, 2000);
        return false;
      }
      return true;
    },
    deleteTocken(name) {
      // удаляем токен
      this.$store.commit('setModalDelete', {
        id: this.idDash,
        status: true,
        elem: '',
        name,
        page: 'tocken',
      }); // просто отправляем информацию об удаляемом токене в хранилище
    },
    deleteSearch(id) {
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
        });
      });
    },
    async startSearch(search) {
      this.$store.commit('updateSearchStatus', {
        idDash: this.idDash,
        sid: search.sid,
        status: 'empty',
      });
    },
    yesSearch() {
      // кнопка согласия на обновления если токен уже существует

      const id = this.index;
      const newName = this.tempTocken.name;
      this.tempTocken.name = this.tokens[id].name;

      // заменяем сторое значение имени на новое
      delete this.tockensName[this.tempTocken.name];
      this.$set(this.tockensName, newName, newName);

      this.$store.commit('createTockens', {
        idDash: this.idDash,
        tocken: this.tempTocken,
      });
      this.$store.commit('changeTokenName', {
        idDash: this.idDash,
        tocken: this.tempTocken,
        value: newName,
      });

      this.openwarning = false;
      this.showSign = true;
      this.opennewtocken = false;

      this.newTockenName = null;
      this.newElem = '';
      this.newAction = '';
      this.newCapture = '';
      this.newTockenDop = {
        defaultValue: '*',
      };
    },
    noSearch() {
      // если нажали на кнопку нет
      this.openwarning = false;
    },
    checkSid(sid) {
      let newSid = sid;
      // если там больше 10 символов
      if (sid.length > 5) {
        // обрезаем и добовляем троеточие
        newSid = `${sid.substring(0, 5)}...`;
      }
      return newSid;
    },
    openEditSearch(event, sid) {
      if (
        event.target.classList.contains('search-id')
        || event.target.classList.contains('search-query')
      ) {
        this.openEdit(sid);
      }
    },
    exportSearch(sid) {
      this.$emit('downloadData', sid);
    },
    // функция для перетаскивания нового элемнета на полотно
    // (остальную область, ну вы поняли короче)
    dragTool(event) {
      // если пошло что-то не так
      if (event.which !== 1) {
        // то прекращаем функцию
        return;
      }
      let parent = '';
      let elem = '';
      // если мы ухватились не за div
      if (event.target.nodeName !== 'div') {
        elem = event.target;
        // то ка кбы всплываем вверх пока не уткнемся в элемнет с классом tool-one
        while (!elem.classList.contains('tool-one')) {
          elem = elem.parentElement;
        }
        // это будет наш родитель
        parent = elem;
        // а если мы сразу попали как надо
      } else {
        // то присваиваем нужно нам родителя
        parent = event.target.parentElement;
      }

      // получаем координаты нашего элемента
      const originCoord = parent.getBoundingClientRect();
      // это как бы расстояния от точки куда тыкнул пользователь до краев элемнета,
      // это нужно чтобы красиво перемещать
      const shiftX = event.pageX - originCoord.left;
      const shiftY = event.pageY - (originCoord.top + window.pageYOffset);
      // дальше мы создаем как бы клон нашего элемнета
      const avatar = parent.cloneNode(true);
      // и его уже добовляем в body
      document.body.appendChild(avatar);
      // даем ему класс
      avatar.classList.add('avatar');
      avatar.classList.add('draggable-fly');
      // делаем его выше всех
      avatar.style.zIndex = 99;
      // и относительно позиионируем
      avatar.style.position = 'absolute';

      // при движении мыши
      document.onmousemove = (mouseMoveEvent) => {
        // мы перемещаем на самом деле наш автар, а не сам объект
        avatar.style.left = `${mouseMoveEvent.pageX - shiftX}px`;
        avatar.style.top = `${mouseMoveEvent.pageY - shiftY}px`;
        // и храним объект нашего  аватара
        this.avatar = avatar;
      };
      // при клике на элемент
      document.onclick = () => {
        // удаляем аватар из дерева dom
        avatar.remove();
      };
    },
    addDashBoard() {
      // функция создания нового элемнета
      if (this.avatar.nodeName) {
        // если автар существует а не потерялся по пути
        const clientCoord = this.avatar.getBoundingClientRect(); // берем координаты аватара
        const coord = {
          top: clientCoord.top + window.pageYOffset,
          left: clientCoord.left + window.pageXOffset,
        };
        const type = this.avatar.getAttribute('data-type'); // и его тип (table, select and etc)
        this.avatar.remove(); // удаляем аватар из дерева dom
        this.avatar = null; // и у нас тоже его очищаем

        // Создаем новый элемнет на дашборде (стандартные настройки любого элемента)

        this.$set(this.newDashBoard, type, {});
        this.$set(
          this.newDashBoard[type],
          'name_elem',
          type[0].toUpperCase() + type.substring(1),
        );

        const step = { ...this.getSizeGrid };

        step.vert = Math.round(window.innerWidth / Number(step.vert));
        step.hor = Math.round(window.innerHeight / Number(step.hor));

        const size = this.calcGrid(
          settings.size[type].height,
          settings.size[type].width,
          step,
          'size',
        );

        this.$set(this.newDashBoard[type], 'width', size.vert);
        this.$set(this.newDashBoard[type], 'height', size.hor);

        const pos = this.calcGrid(coord.top, coord.left, step, 'pos');
        this.$set(this.newDashBoard[type], 'top', pos.hor);
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
        this.$store.commit('createDashboardVisualization', {
          idDash: this.idDash,
          dashboard: this.newDashBoard,
        }); // создаем новый элемнет

        this.newDashBoard = {};
      }
    },
    calcGrid(top, left, step, action) {
      const size = {};
      let header;
      if (window.screen.width > 1400) {
        header = 50;
      } else {
        header = 40;
      }
      if (action === 'size') {
        header = 0;
      }
      size.vert = Math.round(left / step.vert);
      // size.vert = leftCoord*step.vert;
      size.hor = Math.round((top - header) / step.hor);
      // size.hor = (topCoord*step.hor)+header;
      return size;
    },
    checkPos(size) {
      const result = { top: 0, left: 0 };
      const { clientWidth } = document.querySelector('#app');
      if (size.top < 50) {
        result.top = 70;
      } else {
        result.top = size.top;
      }
      if (size.left < 0) {
        result.left = 20;
      } else {
        result.left = size.left;
      }
      if (size.left + size.width > clientWidth) {
        result.left = clientWidth - size.width - 20;
      } else if (result.left === 0) {
        result.left = size.left;
      }
      return result;
    },
    showModalExin(event) {
      // функция вызова модального окна импорта экспорта
      this.$store.commit('setModalExin', {
        idDash: this.idDash,
        status: true,
        event,
      });
    },
    openSettings() {
      this.$emit('openSettings');

      if (this.colorGear === 'controlsActive') {
        this.colorGear = 'controls';
      } else {
        this.colorGear = 'controlsActive';
      }
    },
    openExim() {
      if (this.colorExim === 'controlsActive') {
        this.colorExim = 'controls';
      } else {
        this.colorExim = 'controlsActive';
      }
      this.openexim = !this.openexim;
    },
    setEvents() {
      if (this.textarea_event !== null && this.textarea_event !== '') {
        const events = this.textarea_event.split('\n');
        let reg;
        let body;
        let bodyArray;
        let element;
        let doing;
        let originItem;

        if (events.length !== 0) {
          events.forEach((item) => {
            originItem = item;
            if (item !== '') {
              // reg = new RegExp(/^[\s+]?[\w]+\(/, 'g');
              reg = /^[\s+]?[\w]+\(/g;
              this.$set(
                this.event,
                'event',
                reg.exec(item)[0].replace('(', ''),
              );
              // reg = new RegExp(/\(.+\)/, 'g');
              reg = /\(.+\)/g;
              [body] = reg.exec(item);
              body = body.slice(1, body.length - 1);
              bodyArray = body.split(',');
              bodyArray.forEach((elem, i) => {
                if (elem.indexOf('(') !== -1) {
                  element = bodyArray.splice(0, i);
                }
              });

              if (this.event.event === 'OnDataCompare') {
                if (element.length > 2 && element[1].indexOf('[') === -1) {
                  this.$set(this.event, 'compare', element[0]);
                  this.$set(this.event, 'column', element[1]);
                  this.$set(
                    this.event,
                    'row',
                    element.splice(2, element.length - 1).join(','),
                  );
                } else {
                  this.$set(this.event, 'compare', element[0]);
                  this.$set(
                    this.event,
                    'sense',
                    element.splice(1, element.length - 1).join(','),
                  );
                }
              } else if (this.event.event === 'OnTokenCompare') {
                this.$set(this.event, 'compare', element[0]);
                this.$set(this.event, 'token', element[1]);
                this.$set(
                  this.event,
                  'tokenval',
                  element.splice(2, element.length - 1).join(','),
                );
              } else if (this.event.event === 'onValueCompare') {
                if (element.length === 2) {
                  this.$set(this.event, 'treshold', element[0]);
                  this.$set(this.event, 'color', element[1]);
                } else {
                  element.forEach((elementItem, index) => {
                    if (elementItem.indexOf(']') !== -1) {
                      this.$set(
                        this.event,
                        'treshold',
                        element.slice(0, index + 1).join(','),
                      );
                      this.$set(
                        this.event,
                        'color',
                        element.slice(index + 1, element.length).join(','),
                      );
                    }
                  });
                }
              } else {
                this.$set(this.event, 'element', element[0]); // click
                if (element[1]) {
                  if (element[1].indexOf('[') !== -1) {
                    let j = -1;
                    element.forEach((elementItem, i) => {
                      if (elementItem.indexOf(']') !== -1) {
                        j = i;
                      }
                    });
                    let [, partelement] = element;
                    for (let i = 2; i < j + 1; i += 1) {
                      partelement += `,${element[i]}`;
                    }
                    this.$set(this.event, 'partelement', partelement);
                  } else {
                    this.$set(this.event, 'partelement', element[1]);
                  }
                } else {
                  this.$set(this.event, 'partelement', 'empty');
                }
              }
              // reg = new RegExp(/\w+\(.+\)/, 'g');
              reg = /\w+\(.+\)/g;
              [doing] = reg.exec(body);
              doing = doing.split('(');
              this.$set(this.event, 'action', doing[0]);
              if (doing[0].toLowerCase() === 'set'.toLowerCase()) {
                doing = doing[1].slice(0, doing[1].length - 1).split(',');

                this.$set(this.event, 'target', doing[0]);
                doing.splice(0, 1);
                doing = doing.join(',');
                if (doing.indexOf('[') !== -1 && doing.indexOf(']') !== -1) {
                  doing = doing.match(/[^[]+(?=\])/g);
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
              } else if (doing[0].toLowerCase() === 'go'.toLowerCase()) {
                /// go

                // TODO: оставленно специально, если возникнет баг в смежном функционале
                // doing = doing[1].slice(0, doing[1].length - 1).split(',');
                doing = doing[1].match(/([\w-_]+)|(\[([^\]]+)])/g);
                this.$set(this.event, 'target', doing[0]);
                let prop;
                let value;
                let tab;

                if (doing[3] && doing[3].indexOf('[') !== -1) {
                  prop = [doing[1]];
                  value = [`$${doing[1]}$`];
                  tab = doing[2] ?? 1;
                  doing.splice(0, 3);
                  doing = doing.join(',');
                  doing = doing.match(/[^[]+(?=\])/g);

                  if (doing.length === 1) {
                    value = [...value, ...doing[0].split(',')
                      .map((token) => `$${token.replace(' ', '')}$`)];
                    prop = [...prop, ...doing[0].split(',')];
                    prop = prop.map((token) => token.replace(' ', ''));
                  } else {
                    value = [...value, ...doing[0].split(',')];
                    value = value.map((val) => val.replace(' ', ''));
                    prop = [...prop, ...doing[1].split(',')];
                    prop = prop.map((token) => token.replace(' ', ''));
                  }
                } else {
                  prop = [doing[1]];
                  value = [doing[1]];
                  tab = doing[2] ?? 1;
                }
                this.$set(this.event, 'prop', prop);
                this.$set(this.event, 'tab', tab);
                this.$set(this.event, 'value', value);
              } else if (doing[0].toLowerCase() === 'open'.toLowerCase()) {
                // open
                doing = doing[1].slice(0, doing[1].length - 1).split(',');

                this.$set(this.event, 'target', doing[0]);
                this.$set(this.event, 'prop', [doing[1]]);
                this.$set(this.event, 'value', [doing[2]]);

                this.$set(this.event, 'widthPersent', doing[3]);
                this.$set(this.event, 'heightPersent', doing[4]);

                this.$set(this.event, 'header', doing[5]);
              } else if (
                doing[0].toLowerCase() === 'changeReport'.toLowerCase()
              ) {
                // changeReport

                [, doing] = originItem.split(doing[0]);
                doing = doing.replace(/\(/g, '').replace(/\)/g, '').split(',');
                this.$set(this.event, 'sid', doing[0]);
                if (doing[1].indexOf('[') !== -1) {
                  doing.splice(0, 1);
                  const files = doing.map((file) => file.replace('[', '').replace(']', ''));
                  this.$set(this.event, 'file', files);
                } else {
                  this.$set(this.event, 'file', [doing[1]]);
                }
              } else if (
                doing[0].toLowerCase() === 'exportSearch'.toLowerCase()
              ) {
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
        this.$store.commit('setEvents', {
          event: null,
          eventFull: null,
          idDash: this.idDash,
        });

        this.events = [];

        this.openEventCode();
      }
    },

    changeColor() {
      if (document.querySelectorAll('.v-menu__content').length !== 0) {
        document.querySelectorAll('.v-menu__content').forEach((item) => {
          item.style.background = this.theme.back;
          item.style.color = this.theme.text;
          item.style.border = `1px solid ${this.theme.border}`;
        });
      }
    },
    saveDash() {
      const dash = this.dashFromStore;
      const response = this.$store.dispatch('saveDashboard', {
        id: this.idDash,
        body: JSON.stringify(dash),
      });
      response.then((res) => {
        this.errorSave = true;
        if (res.status === 200) {
          this.colorErrorSave = this.theme.controls;
          this.msgErrorSave = 'Дашборд сохранен';
          this.$store.dispatch(
            'auth/putLog',
            `Сохранен дашборд  ${this.toHichName(res.data.name)} c id ${
              res.data.id
            }`,
          );
          this.updateDash({ data: res.data, dash });
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
    updateDash(dash) {
      this.$store.commit('updateDash', {
        dash: { body: JSON.stringify(dash.dash), id: this.idDash },
        modified: dash.data.modified,
      });
      this.$store.dispatch('saveDashToStore', this.idDash);
      this.$store.dispatch(
        'auth/putLog',
        `Обновлен дашборд ${this.toHichName(dash.data.name)} с id ${
          this.idDash
        }`,
      );
    },
    toHichName(name) {
      return name[0].toUpperCase() + name.slice(1);
    },
    toHome() {
      this.$router.push('/main');
    },
    openNavPanel() {
      this.$store.commit('app/toggleOpenTree');
      this.gearShow = false;
    },
    getScreenHeight() {
      return 0.9 * window.innerHeight;
    },
    updateScreenHeight() {
      this.screenHeight = this.getScreenHeight();
    },
    uploadTokens() {
      const tokens = this.$store.state[this.idDash].tockens
        ? this.$store.state[this.idDash].tockens
        : [];

      tokens.forEach((item) => {
        this.tockensName[item.name] = item.name;
        this.lookTockens.push({ show: false, color: this.theme.controls });
      });
      this.tokens = JSON.parse(JSON.stringify(tokens));
    },
  },
};
</script>

<style lang="scss">
@import '../sass/dashPanelBoard.sass';
</style>

<style scoped>
.iconsNavigations {
  display: flex;
  justify-content: center;
  flex-direction: row;
}

.save-name {
  overflow-wrap: anywhere;
}

.v-tooltip__content {
  width: fit-content;
}
.backlight-tkn {
  font-family: monospace, Consolas;
  background-color: #9992;
}
.row-tocken::v-deep .v-menu__content {
  max-width: initial;
}
.main-title {
  overflow: hidden;
}
.title-name {
  overflow: hidden;
  white-space: nowrap;
  min-height: 1.5em;
}
.user-control-panel {
  display: inline-flex;
}
</style>
