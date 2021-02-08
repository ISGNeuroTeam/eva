<template>
  <div 
    class="header-block" 
    :style="{background: color.panel, height: height }"
  >
    <div class="aut-panel">
      <div class="nav-btn">
        <div 
          class="title-main" 
          :style="{color:'white', opacity: '0.4'}"
        >
          EVA
        </div>
        <v-tooltip 
          bottom 
          :color="color.controlsActive" 
        >
          <template v-slot:activator="{ on }">
            <v-icon 
              class="home"  
              color="white" 
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
          :color="color.controlsActive" 
        >
          <template v-slot:activator="{ on }">
            <v-icon 
              class="undo"  
              color="white" 
              v-on="on"
              @click="toBackward"
            >
              {{ undo }}
            </v-icon>
          </template>
          <span>Назад</span>
        </v-tooltip>
        <v-tooltip 
          bottom 
          :color="color.controlsActive" 
        >
          <template v-slot:activator="{ on }">
            <v-icon 
              class="palete"  
              color="white" 
              :data-theme="theme"
              v-on="on"
              @click="paleteShow = !paleteShow"
            >
              {{ palete }}
            </v-icon>
          </template>
          <span>Настройки темы</span>
        </v-tooltip>
      </div>
      <div class="manage-btn">
        <div 
          class="id-user" 
          :style="{color:'white'}"
        >
          {{ login }}
          | 
        </div>
        <v-tooltip 
          v-if="isAdmin"
          bottom 
          :color="color.controlsActive" 
        >
          <template v-slot:activator="{ on }">
            <v-icon 
              class="edit icon-aut" 
              :color="colorError" 
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
          :color="color.controlsActive" 
        >
          <template v-slot:activator="{ on }">
            <v-icon 
              class="edit icon-aut" 
              color="white" 
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
          :color="color.controlsActive"  
        >
          <template v-slot:activator="{ on }">
            <v-icon 
              class="exit icon-aut" 
              color="white" 
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
      :modalActive="modalActive" 
      :colorFrom="color"  
      @cancelModal="modalActive=false" 
    />
    <theme-settings 
      :color-from="color" 
      :palete-from="paleteShow"
    />
  </div>    
</template>


<script>

import { mdiDoor, mdiAccountEdit, mdiPalette, mdiUndoVariant,  mdiHomeVariantOutline, mdiScriptTextOutline } from '@mdi/js'

import themes from '../js/themeSettings.js';

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
      userEdit: mdiAccountEdit,
      log: mdiScriptTextOutline,
      modalActive: false,
      home: mdiHomeVariantOutline,
      undo: mdiUndoVariant,
      palete: mdiPalette,
      paleteShow: false,
      color: { },
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
      this.color = themes[this.$store.getters.getTheme];
      this.getTheme(this.$store.getters.getTheme);
      return this.$store.getters.getTheme
    },
    isAdmin(){
       if (this.userPermissions && this.userPermissions.includes('admin_all') ){
          return true
       } else{ 
         return false
       }
    }
  },  
  methods: {
    getTheme: async function(theme) {
      
      let themeBack = await this.$store.getters.getThemeBack();
      if (themeBack.setting && themeBack.setting != '') {
        let settings = JSON.parse(themeBack.setting);
        if (settings.theme != theme) {
          this.$store.commit('setTheme', settings.theme);
        }
      }
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
  },
  mounted() {
    this.getCookie();
    this.color = themes[this.theme];
  } 
}


</script>

<style lang="sass" > 
  
   @import '../sass/header.sass'

   
</style>