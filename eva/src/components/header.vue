<template>
  <div 
    class="header-block" 
    :style="{background: theme.$main_bg, height: height }"
  >
    <div class="aut-panel">
      <div class="nav-btn">
        <div 
          class="title-main" 
          :style="{color: theme.$secondary_text}"
        >
          EVA
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
              @click="toHome"
            >
              {{ home }}
            </v-icon>
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
      <div class="manage-btn">
        <div 
          class="id-user" 
          :style="{color:theme.$secondary_text}"
        >
          {{ login }}
          | 
        </div>
        <v-tooltip 
          v-if="isAdmin"
          bottom 
          :color="theme.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <v-icon 
              class="edit icon-aut" 
              :color="theme.$secondary_text"
              v-on="on" 
              @click="openLogs()"
            >
              {{ log }}
            </v-icon>
          </template>
          <span>Просмотреть логи</span>
        </v-tooltip>
        <v-tooltip 
          v-if="!inside" 
          bottom 
          :color="theme.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <v-icon 
              class="edit icon-aut"
              :color="theme.$secondary_text"
              v-on="on"
              @click="edit"
            >
              {{ userEdit }}
            </v-icon>
          </template>
          <span>Редактировать профиль</span>
        </v-tooltip>
        <v-tooltip
          bottom
          :color="theme.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <v-icon
              class="edit icon-aut"
              :color="theme.$secondary_text"
              v-on="on"
              @click="openThemeModal"
            >
              {{ mdiCompare }}
            </v-icon>
          </template>
          <span>Сменить тему</span>
        </v-tooltip>
        <v-tooltip 
          bottom 
          :color="theme.$accent_ui_color"
        >
          <template v-slot:activator="{ on }">
            <v-icon 
              class="exit icon-aut"
              :color="theme.$secondary_text"
              v-on="on" 
              @click="exit"
            >
              {{ door }}
            </v-icon>
          </template>
          <span>Выйти из профиля</span>
        </v-tooltip>
      </div>   
    </div>
    <modal-log 
      :modal-active="modalActive"
      @cancelModal="modalActive=false" 
    />
    <theme-settings 
      :palete-from="paleteShow"
    />
  </div>    
</template>


<script>

import { mdiDoor, mdiCompare, mdiAccountEdit, mdiPalette, mdiUndoVariant,  mdiHomeVariantOutline, mdiScriptTextOutline } from '@mdi/js'
import Vue from "vue";
import VueJWT from 'vuejs-jwt'

Vue.use(VueJWT, {'storage': 'cookie','keyName': 'eva_token'})

export default {
  props: {
    inside: null
  },
  data () {
    return {
      login: '',
      user: {},
      door: mdiDoor,
      mdiCompare: mdiCompare,
      userEdit: mdiAccountEdit,
      log: mdiScriptTextOutline,
      modalActive: false,
      home: mdiHomeVariantOutline,
      undo: mdiUndoVariant,
      palete: mdiPalette,
      paleteShow: false,
      userPermissions: null
    } 
  },
  computed: { 
    colorError: function() {
      if (this.$store.getters.getColorError) {
        return this.color.controlsActive
      } else {
        return 'white'
      } 
    },
    height: function() {
      if (screen.width < 1400) {
        return '40px'
      } else {
        return "50px"
      }
    },
    theme: function() {
      return this.$store.getters.getTheme
    },
    isAdmin() {
      if (this.userPermissions && this.userPermissions.includes('admin_all')) {
        return true
      } else {
        return false
      }
    }
  },
  mounted() {
    this.getCookie();
  },  
  methods: {
    getTheme: async function() {
      this.$store.commit('setTheme', 'dark');
    },
    openThemeModal(){
      this.paleteShow = !this.paleteShow;
    },
    getCookie: async function() {
      //console.log(this.$jwt.hasToken())
      if(this.$jwt.hasToken()) {
        this.login = this.$jwt.decode().username;
        //let id = this.$jwt.decode().user_id;
        let permissions = [];

        let response = await fetch(`/api/user/permissions`)
          .catch (error => {
            console.log(error);
            return {status: 300, result: 'Post не создался, возможно из-за неточностей в запросе'}
          }) 

        if (response.status == 200) {  // если получилось
          await response.json().then( res => {  // переводим полученные данные из json в нормальный объект
            permissions = res.data;
            this.userPermissions = permissions
            this.$emit('permissions',permissions);
            this.$emit('setUsername',this.login);
            this.$emit('checkOver');
          }) 
        } else {
          this.exit();
        }
                         
      } else {
        this.$router.push(`/`);
      }

    },
    exit: function() {
      document.cookie = `eva-dashPage=''; max-age=0 ; path=/`;
      document.cookie = `eva_token=''; max-age=0 ; path=/`;
      this.$store.commit('clearState');
      this.$router.push(`/`); 
    },
    edit: function() {
      this.$router.push(`/profile`);  
    },
    toHome: function() {
      this.$router.push(`/main`);
    },
    toBackward: function() {
      this.$router.go(-1);
    },
    openLogs: function() {
      this.modalActive=true;
      this.$store.commit('setErrorLogs',false);
    },
  } 
}


</script>

<style lang="scss" > 
  
   @import '../sass/header.sass'

   
</style>