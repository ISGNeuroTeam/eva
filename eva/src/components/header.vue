<template>
  <div class="dash-main" :style="{ background: theme.$main_bg, height }">
    <div class="main-title">
      <div class="logo-block">
        <EvaLogo />
      </div>
      <div class="title-name" :style="{ color: theme.$title }">
        {{ titlePage }}
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
      <div class="user-control-panel" v-if="inside">
        <v-tooltip bottom :color="theme.$accent_ui_color">
          <template v-slot:activator="{ on }">
            <v-icon
              class="control-button theme--dark"
              :style="{ color: theme.$secondary_text }"
              v-on="on"
              @click="openLogs"
            >
              {{ logIcon }}
            </v-icon>
          </template>
          <span>Открыть окно логов</span>
        </v-tooltip>
      </div>
      <v-menu :nudge-width="100" class="profile-block" offset-y>
        <template v-slot:activator="{ on }">
          <div class="dropdown-profile" v-on="on">
            <v-icon
              :style="{ color: theme.$secondary_text }"
              class="profile theme--dark"
            >
              {{ profile_icon }}
            </v-icon>
            <div class="id-user profile-login" :style="{ color: theme.$secondary_text }">
              {{ login }}
            </div>
          </div>
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

    <modal-log :modal-active="modalActive" @cancelModal="modalActive = false" />
    <modal-themes :show="paleteShow" :admin="isAdmin" @closeModal="paleteShow = false" />
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
  } from '@mdi/js';
  import Vue from 'vue';
  import VueJWT from 'vuejs-jwt';
  import EvaLogo from '../images/eva-logo.svg';

  Vue.use(VueJWT, { storage: 'cookie', keyName: 'eva_token' });

  export default {
    components: {
      EvaLogo,
    },
    props: {
      inside: null,
    },
    data() {
      return {
        login: '',
        user: {},
        titlePage: this.$router.history.current.name,
        door: mdiDoor,
        mdiCompare: mdiCompare,
        userEdit: mdiAccountEdit,
        code_icon: mdiCodeTags,
        tocken_icon: mdiVariable,
        profile_icon: mdiAccount,
        logIcon: mdiScriptTextOutline,
        modalActive: false,
        home: mdiHomeVariantOutline,
        undo: mdiUndoVariant,
        palete: mdiPalette,
        paleteShow: false,
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
        userPermissions: null,
      };
    },
    computed: {
      height: function () {
        if (screen.width < 1400) {
          return '50px';
        } else {
          return '51px';
        }
      },
      theme: function () {
        return this.$store.getters.getTheme;
      },
      isAdmin() {
        if (this.userPermissions && this.userPermissions.includes('admin_all')) {
          return true;
        } else {
          return false;
        }
      },
    },
    mounted() {
      this.getCookie();
    },
    methods: {
      getTheme: async function () {
        this.$store.commit('setTheme', 'dark');
      },
      openThemeModal() {
        this.paleteShow = !this.paleteShow;
      },
      getCookie: async function () {
        //console.log(this.$jwt.hasToken())
        if (this.$jwt.hasToken()) {
          this.login = this.$jwt.decode().username;
          //let id = this.$jwt.decode().user_id;
          let permissions = [];

          let response = await fetch(`/api/user/permissions`).catch(error => {
            console.log(error);
            return {
              status: 300,
              result: 'Post не создался, возможно из-за неточностей в запросе',
            };
          });

          if (response.status == 200) {
            // если получилось
            await response.json().then(res => {
              // переводим полученные данные из json в нормальный объект
              permissions = res.data;
              this.userPermissions = permissions;
              this.$emit('permissions', permissions);
              this.$emit('setUsername', this.login);
              this.$emit('checkOver');
            });
          } else {
            this.exit();
          }
        } else {
          this.$router.push(`/`);
        }
      },
      exit: function () {
        document.cookie = `eva-dashPage=''; max-age=0 ; path=/`;
        document.cookie = `eva_token=''; max-age=0 ; path=/`;
        this.$store.commit('clearState');
        this.$router.push(`/`);
      },
      edit: function () {
        this.$router.push(`/profile`);
      },
      toHome: function () {
        this.$router.push(`/main`);
      },
      toBackward: function () {
        this.$router.go(-1);
      },
      openLogs: function () {
        this.modalActive = true;
        this.$store.commit('setErrorLogs', false);
      },
    },
  };
</script>

<style lang="scss">
  @import '../sass/dashPanelBoard.sass';
</style>
