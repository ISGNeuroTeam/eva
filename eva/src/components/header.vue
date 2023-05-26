<template>
  <div
    class="dash-main"
    :style="{ background: theme.$main_bg, height }"
  >
    <div class="main-title">
      <div class="logo-block">
        <EvaLogo />
      </div>
      <div
        class="title-name"
        :style="{ color: theme.$title }"
      >
        {{ titlePage }}
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
            @click="$store.commit('app/toggleOpenTree')"
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
          <router-link to="/main">
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
            class="undo"
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
        v-if="inside"
        class="user-control-panel"
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
              {{ mdiCloudUpload }}
            </v-icon>
          </template>
          <span>Загрузка SVG</span>
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

    <modal-log v-model="modalActive" />
    <modal-themes
      v-model="paleteShow"
      :admin="isAdmin"
    />
    <modal-loading-svg
      v-model="loadSvg"
      @updateModalValue="loadSvg = false"
    />
  </div>
</template>

<script>
import {
  mdiDoor,
  mdiCompare,
  mdiVariable,
  mdiCodeTags,
  mdiAccount,
  mdiAccountEdit,
  mdiPalette,
  mdiUndoVariant,
  mdiHomeVariantOutline,
  mdiScriptTextOutline,
  mdiCloudUpload,
  mdiFileTree,
} from '@mdi/js';
import { mapGetters } from 'vuex';
import EvaLogo from '../images/eva-logo.svg';

export default {
  components: {
    EvaLogo,
  },
  props: {
    inside: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      user: {},
      titlePage: this.$router.history.current.name,
      door: mdiDoor,
      mdiCompare,
      userEdit: mdiAccountEdit,
      code_icon: mdiCodeTags,
      tocken_icon: mdiVariable,
      profile_icon: mdiAccount,
      logIcon: mdiScriptTextOutline,
      modalActive: false,
      home: mdiHomeVariantOutline,
      undo: mdiUndoVariant,
      palete: mdiPalette,
      iconTree: mdiFileTree,
      paleteShow: false,
      profileDropdownButtons: [
        {
          id: 1,
          label: 'Редактировать',
          icon: mdiAccountEdit,
          onClick: this.edit,
          // hide: this.inside,
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
      loadSvg: false,
      mdiCloudUpload,
    };
  },
  computed: {
    ...mapGetters('auth', [
      'isAdmin',
      'permissions',
    ]),
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
    height() {
      return window.screen.width < 1400 ? '50px' : '51px';
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    login() {
      return this.$store.getters['auth/userName'];
    },
  },
  mounted() {
    this.getCookie();
    this.$store.commit('app/setOpenTree', false);
  },
  methods: {
    async getTheme() {
      this.$store.commit('setTheme', 'dark');
    },
    openThemeModal() {
      this.paleteShow = !this.paleteShow;
    },
    async getCookie() {
      if (this.$jwt.hasToken()) {
        // let id = this.$jwt.decode().user_id;
        let permissions = [];

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
            permissions = res.data;
            this.$store.commit('auth/permissions', permissions);
            this.$emit('permissions', permissions);
            this.$emit('setUsername', this.login);
            this.$emit('checkOver');
          });
        } else {
          this.exit();
        }
      }
    },
    exit() {
      this.$store.dispatch('auth/logout');
      this.$store.dispatch('app/resetState');
      this.$root.$emit('setDocumentTitle', null);
    },
    edit() {
      this.$router.push('/profile');
    },
    toHome() {
      this.$router.push('/main');
    },
    toBackward() {
      this.$router.go(-1);
    },
    openLogs() {
      this.modalActive = true;
      this.$store.commit('setErrorLogs', false);
    },
  },
};
</script>

<style lang="scss">
@import '../sass/dashPanelBoard.sass';
</style>
