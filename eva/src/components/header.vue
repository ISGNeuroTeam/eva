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
        :open-delay="openTooltipDelay"
      >
        <template v-slot:activator="{ on }">
          <v-btn
              icon
              v-on="on"
              :color="theme.$secondary_text"
              @click="$store.commit('app/toggleOpenTree')"
          >
            <v-icon>
              {{ iconTree }}
            </v-icon>
          </v-btn>
        </template>
        <span>Дерево</span>
      </v-tooltip>
      <v-tooltip
        bottom
        :color="theme.$accent_ui_color"
        :open-delay="openTooltipDelay"
      >
        <template v-slot:activator="{ on }">
          <v-btn
              to="/main"
              icon
              v-on="on"
              class="home"
              :color="theme.$secondary_text"
          >
            <v-icon>
              {{ home }}
            </v-icon>
          </v-btn>
        </template>
        <span>На главную</span>
      </v-tooltip>
      <v-tooltip
        bottom
        :color="theme.$accent_ui_color"
        :open-delay="openTooltipDelay"
      >
        <template v-slot:activator="{ on }">
          <v-btn
              icon
              v-on="on"
              :color="theme.$secondary_text"
              @click="toBackward"
          >
            <v-icon>
              {{ undo }}
            </v-icon>
          </v-btn>
        </template>
        <span>Назад</span>
      </v-tooltip>
    </div>
    <div class="control-block">
      <div
        v-if="inside"
        class="user-control-panel px-3"
      >
        <v-tooltip
          bottom
          :color="theme.$accent_ui_color"
          :open-delay="openTooltipDelay"
        >
          <template v-slot:activator="{ on }">
            <v-btn
                icon
                v-on="on"
                :color="theme.$secondary_text"
                :class="{'v-btn--active': loadSvg}"
                @click="loadSvg = !loadSvg"
            >
              <v-icon>
                {{ mdiCloudUpload }}
              </v-icon>
            </v-btn>
          </template>
          <span>Загрузка файла</span>
        </v-tooltip>
        <v-tooltip
          bottom
          :color="theme.$accent_ui_color"
          :open-delay="openTooltipDelay"
        >
          <template v-slot:activator="{ on }">
            <v-btn
                v-on="on"
                icon
                :color="getColorError ? theme.$primary_button : theme.$secondary_text"
                :class="{'v-btn--active': modalActive}"
                @click="openLogs">
              <v-icon>
                {{ logIcon }}
              </v-icon>
            </v-btn>
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
            :open-delay="openTooltipDelay"
          >
            <template v-slot:activator="{ on: onTooltip }">
              <div
                v-on="{ ...onMenu, ...onTooltip }"
              >
                <v-btn
                    text
                    rounded
                    class="ml-2 pl-2 profile-login mr-2"
                    v-on="{ ...onMenu, ...onTooltip }"
                    :color="theme.$secondary_text"
                >
                  <v-icon
                      class="profile theme--dark"
                  >
                    {{ profile_icon }}
                  </v-icon>
                  {{ login }}
                </v-btn>
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
                @click.middle="item.onMiddleClick"
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
    openTooltipDelay: {
      type: Number,
      default: 1000,
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
          onMiddleClick: () => {
            const routeData = this.$router.resolve('/profile');
            window.open(routeData.href, '_blank');
          },
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
.home.v-btn:before {
  opacity: 0
}
</style>
