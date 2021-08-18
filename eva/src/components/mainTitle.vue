<template>
  <v-app 
    class="aplication" 
    :style="{background:theme.$secondary_bg}"
  >
    <header-top 
      :class="{openHeader:!openProfile}"
      @permissions="setPermissions" 
      @checkOver="checkOver"
    />
    <div 
      v-if="prepared"
      class="body-block" 
    >
      <dash-panel-bord
        :id-dash-from="idDash" 
        :color-from="theme"
        :style="{top:top, display:display}" 
        :permissions-from="permissions"
        @changeMode="changeMode" 
        @openProfile="event => {openProfile = event}" 
        @openSettings="openSettings" 
      />
      <v-card 
        v-if="alreadyShow"
        class="already-block"  
        :style="{color:theme.$main_text,background:theme.$main_bg}"
      >
        <div class="text-already">
          Существует более новая версия дашборда. Хотите обновить?
        </div>
        <div class="btn-already">
          <v-btn 
            small 
            :color="theme.$primary_button"
            class="create-btn" 
            @click="updateDash"
          >
            Да
          </v-btn>
          <v-btn 
            small
            :color="theme.$primary_button"
            class="create-btn" 
            @click="alreadyShow = false"
          >
            Нет
          </v-btn>
        </div> 
      </v-card>
      <v-main id="content">
        <v-container class="dash-container">
          <div
            v-if="gridShow"
            class="overlay-grid"
            :data-grid="true"
            :style="{height: `calc(100vh - ${headerTop}px + ${deltaHorizontal}px)`,top:`${headerTop}px` ,background: `linear-gradient(-90deg, ${theme.$main_text} 1px, transparent 1px) repeat scroll 0% 0% / ${verticalCell}px ${verticalCell}px,
            rgba(0, 0, 0, 0) linear-gradient(${theme.$main_text} 1px, transparent 1px) repeat scroll 0% 0% / ${horizontalCell}px ${horizontalCell}px`}"
          />
          <move-able 
            v-for="elem in elements" 
            :key="hash(elem)"  
            :data-mode-from="mode" 
            :color-from="theme"
            :id-dash-from="idDash" 
            :data-elem="elem" 
            :data-page-from="page"
            :horizontal-cell="horizontalCell"
            :vertical-cell="verticalCell"
          />
          <modal-delete 
            :color-from="theme"
            :id-dash-from="idDash" 
            :data-page-from="page"
          />
          <modal-search 
            :color-from="theme"
            :id-dash-from="idDash" 
          />
          <modal-settings 
            :color-from="theme"
            :id-dash-from="idDash"   
          />
            
          <!-- 
              НЕ УДАЛЯТЬ ЦВЕТОВЫЕ НАСТРОЙКИ
              <dash-settings :showFrom="showSetting"  ></dash-settings> 
          -->
        </v-container>
      </v-main> 
    </div>
    <footer-bottom />
  </v-app> 
</template>

<script> 

import themes from '../js/themeSettings.js';

export default {
  data () {
    return {
      page: 'dash',
      mode: false,
      showSetting: false,
      rotate: '',
      openProfile: false,
      alreadyDash: {},
      alreadyShow: false,
      letElements: false,
      prepared: false,
      colorChange: false,
      permissions: [],
      deltaHorizontal: 0,//сколько надо увеличить высоту overlay-grid,по первое знач-500,
      startClientHeight: 0,
      startClientWidth: 0,
      verticalCell: 0,
      horizontalCell: 0
    }
  },   
  computed: {
    idDash: function() {   // получаем id страницы от родителя
      return this.$route.params.id
    },
    elements: function() {  // получаем название элемента  от родителя
      let elements = [];
        
      if (this.letElements) {
        elements =  this.$store.getters.getElements(this.idDash)
      } 
      return elements
    },
    top: function() {
      if (this.openProfile) {
        if (screen.width < 1400) {
          return '40px'
        } else {
          return '50px'
        }
      } else {
        return '0px'
      }
    },
    headerTop: function (){
      if(document.body.clientWidth <=1400){
        return 40
      } else {
        return 50
      }
    },
    theme: function() {
      return this.$store.getters.getTheme
    },
    display: function() {
      if (this.$route.query.header === 'false'){
        return 'none'
      } else {
        return 'flex'
      }
    },
    gridShow: function() {
      let gridShow = this.$store.getters.getGridShow(this.idDash);
      gridShow == 'true' ? gridShow = true : gridShow = false;
      return gridShow;
    },
    getSizeGrid: function(){
      return this.$store.getters.getSizeGrid(this.idDash)
    }
  },  
  watch: {
    getSizeGrid: function() {
      this.calcSizeCell()
    }
  },
  mounted() {
    document.title=`EVA | ${this.$store.getters.getName(this.idDash)}`
    this.createStartClient();
    this.calcSizeCell();
    this.addScrollListener();
  },
  methods: {
    hash: function(elem) {
      return `${elem}#${this.idDash}`
    },
    changeMode: function() {
      this.mode = !this.mode;
    },
    openSettings: function() {
      this.showSetting = !this.showSetting;
    },
    setPermissions: function(event) { 
      this.permissions = event;       
    },
    checkOver: function() {
      this.letElements = true;
      this.checkAlreadyDash();
    },
    updateDash: function() {
      this.$store.commit('updateDash',{dash: this.alreadyDash,modified: this.alreadyDash.modified});
      this.$store.auth.getters.putLog(`Обновлен дашборд ${this.toHichName(this.alreadyDash?.name)} с id ${this.alreadyDash.id}`);
      this.alreadyShow = false;
    },
    toHichName: function(name) {
      return name[0].toUpperCase() + name.slice(1);
    },
    checkAlreadyDash: function() {
      let response =  this.$store.getters.checkAlreadyDash(this.$route.params.id);
      response.then( res => {
        if (res.status == 'exist') {  
          this.alreadyShow = true;
          this.alreadyDash = res;
        } 
        this.prepared = true;
      })
    },
    createStartClient: function(){ 
      //первоначальные значения высоты и ширины
      this.startClientHeight = document.body.clientHeight - this.headerTop
      this.startClientWidth = document.body.clientWidth
    },
    calcSizeCell: function(){
      //размер ячейки
      let grid = this.$store.getters.getSizeGrid(this.idDash);
      this.verticalCell = Number((this.startClientWidth /grid.vert).toFixed(1));
      this.horizontalCell = Number((this.startClientHeight/ grid.hor).toFixed(1));
    },
    addScrollListener: function(){ 
      let otstup = 0;
      window.addEventListener('scroll' , () => {  // при увеличении экрана в высоту (вообще коненчо срабатывает при скролле страницы)       
        if (document.querySelector('.aplication')) {
          if (document.body.scrollHeight > document.body.clientHeight) { // если высота скролируемого экрана больше чем клиентского
          //добавляем размер
            otstup = this.horizontalCell;
          } else {
            otstup = 0;
          //просто сработало событие
          }
          let _maxHeigth = (Math.round(document.querySelector('.aplication').clientHeight/this.horizontalCell)) * this.horizontalCell
          this.deltaHorizontal = (_maxHeigth - this.startClientHeight)

          document.querySelector('.aplication').style.height =  `${document.body.scrollHeight+otstup}px`; // в любом случае расширяем контейнер до размеров экрана
        }
      })

    }
  }
}
</script>

<style lang="scss">

    .aplication {
        position: relative;
    }
    .aplication:before {
        content: ' ';
        display: block;
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        opacity: var(--image_opacity);
        background-image: var(--background_image);
        background-repeat: no-repeat;
        background-position: 50% 0;
        background-size: cover;
    }
    .aplication .already-block {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center;
        padding: 15px;
        position: absolute;
        top: 60px;
        left: 10px;
        z-index: 12;
    }
    .aplication .already-block .text-already {
        font-size: 15px
    } 
    .aplication .already-block .btn-already {
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-start;
        align-items: center; 
    } 
    .aplication .already-block .btn-already .create-btn {
        color: white;
        margin-left: 10px;
        cursor: pointer
    } 
    .aplication .dash-container {
        max-width: 100%;
        padding: 0;
    }

    .overlay-grid {
      position: absolute;
      left: 0;
      width: 100%;
      opacity: 0.2;
      transition: all ease 0.3s
    }
    .dash-grid-layout {
      margin-top: 50px
    }
    .dash-grid-layout .dash-grid-item {
      background: black;
      color: white;
    }
    
</style>