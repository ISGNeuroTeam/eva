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
            :key="hash(elem.elem)"
            :data-mode-from="mode"
            :color-from="theme"
            :id-dash-from="idDash"
            :data-elem="elem.elem"
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
    <div v-show="showTabs" class="tab-panel">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="{active: currentTab === tab.id, hover: tab.hover}"
        class="tab-item"
        @click="clickTab(tab.id)"
        @mouseover="tabOver(tab)"
        @mouseleave="tabLeave(tab)"
        @dblclick="editTabName(tab)"
      >
        {{ tab.name }}
        <svg v-if="tab.hover && tabsMoreOne" class="delete-cross" width="10" height="10" viewBox="0 0 8 8"  xmlns="http://www.w3.org/2000/svg" @click.stop="deleteTab(tab.id)">
          <path
            d="M4 4.94286L1.17157 7.77129L0.228763 6.82848L3.05719 4.00005L0.228763 1.17163L1.17157 0.228817L4 3.05724L6.82843 0.228817L7.77124 1.17163L4.94281 4.00005L7.77124 6.82848L6.82843 7.77129L4 4.94286Z"
            :fill="theme.$main_border"
          />
        </svg>

      </div>
      <div id="plus-icon" @click="addNewTab">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 8V14H6V8H0V6H6V0H8V6H14V8H8Z"/>
        </svg>
      </div>
    </div>
    <footer-bottom />
  </v-app>
</template>

<script>
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
      horizontalCell: 0,
      showTabs: true,
      currentTab: 1,
      // tabs: []
    }
  },
  computed: {
    idDash: function() {   // получаем id страницы от родителя
      return this.$route.params.id
    },
    elements: function() {  // получаем название элемента  от родителя
      return this.letElements ? this.$store.getters.getElements(this.idDash).filter(elem => elem.tab === this.currentTab) : [];
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
    headerTop: function () {
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
      gridShow === 'true' ? gridShow = true : gridShow = false;
      return gridShow;
    },
    getSizeGrid: function() {
      return this.$store.getters.getSizeGrid(this.idDash)
    },
    tabsMoreOne() {
      return this.tabs.length > 1;
    },
    tabs() {
      return JSON.parse(JSON.stringify(this.$store.getters.getDashTabs(this.idDash)))
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
    this.currentTab = this.$store.getters.getCurrentDashTab(this.idDash);
  },
  methods: {
    clickTab(tabID) {
      this.$store.commit('changeCurrentTab', {idDash: this.idDash, tab: tabID});
      this.currentTab = tabID;
    },
    addNewTab() {
      let tabID = [...this.tabs].sort((a,b) => b.id - a.id)[0].id + 1;
      this.$store.commit('addNewTab', {idDash: this.idDash, tabID, tabName: 'Без названия'})
      this.tabs.push({id: tabID, name: 'Без названия'});
    },
    deleteTab(tabID) {
      if (this.tabsMoreOne) {
        this.$store.commit('deleteDashTab', {idDash: this.idDash, tabID});
        if (tabID !== this.currentTab) {
          this.tabs = this.tabs.filter(tab => tab.id !== tabID);
        } else {
          this.tabs = this.tabs.filter(tab => tab.id !== tabID);
          this.currentTab = this.tabs[0].id;
        }
      }
    },
    editTabName(tab) {

    },
    tabOver(tab) {
      this.$set(tab, 'hover' , true)
    },
    tabLeave(tab) {
      this.$set(tab, 'hover' , false)
    },
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
      this.$store.auth.getters.putLog(`Обновлен дашборд ${this.toHichName(this.alreadyDash.name)} с id ${this.alreadyDash.id}`);
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

@import '../sass/mainTitle.sass';

</style>