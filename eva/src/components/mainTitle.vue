<template>
  <v-app
    class="aplication"
    :style="{background:theme.$secondary_bg}"
  >
    <dash-panel-bord
      v-if="prepared"
      :id-dash-from="idDash"
      :permissions-from="permissions"
      @changeMode="changeMode"
      @openProfile="event => {openProfile = event}"
      @openSettings="openSettings"
    />
    <header-top
      v-else
      @permissions="setPermissions"
      @checkOver="checkOver"
    />
    <div
      v-if="prepared"
      class="body-block"
    >
      <v-card
        v-if="alreadyShow"
        class="already-block"
        :style="{ color: theme.$main_text, background: theme.$main_bg }"
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
            :style="{ height: `calc(100vh - ${headerTop}px + ${deltaHorizontal}px)`,top:`${headerTop}px` ,background: `linear-gradient(-90deg, ${theme.$main_text} 1px, transparent 1px) repeat scroll 0% 0% / ${verticalCell}px ${verticalCell}px,
            rgba(0, 0, 0, 0) linear-gradient(${theme.$main_text} 1px, transparent 1px) repeat scroll 0% 0% / ${horizontalCell}px ${horizontalCell}px` }"
          />
          <move-able
            v-for="elem in elements"
            :key="hash(elem.elem)"
            :data-mode-from="mode"
            :id-dash-from="idDash"
            :data-elem="elem.elem"
            :data-page-from="page"
            :horizontal-cell="horizontalCell"
            :vertical-cell="verticalCell"
            :data="getElementData(elem)"
            :loading="checkLoading(elem)"
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
        </v-container>
      </v-main>
    </div>
    <div v-show="showTabs" class="tab-panel">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: currentTab === tab.id,'edit-mode-tab': mode,  hover: tab.id === hoveredTabID }"
        class="tab-item"
        @click="clickTab(tab.id)"
        @mouseover="tabOver(tab.id)"
        @mouseleave="tabLeave(tab.id)"
      >
        <div v-if="tab.id !== editableTabID" style="height: 40px">
          {{ tab.name }}
          <svg v-if="mode" class="edit-icon" width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" @click.stop="enterEditMode(tab)">
            <path d="M1.57833 11.0044C1.41469 11.0041 1.2587 10.9351 1.14841 10.8142C1.03609 10.6943 0.980275 10.5322 0.994996 10.3686L1.13791 8.79705L7.74008 2.19722L9.80333 4.25988L3.20291 10.8591L1.63141 11.0021C1.61333 11.0038 1.59525 11.0044 1.57833 11.0044ZM10.2152 3.84747L8.1525 1.7848L9.38975 0.547549C9.49916 0.438012 9.64763 0.376465 9.80246 0.376465C9.95728 0.376465 10.1057 0.438012 10.2152 0.547549L11.4524 1.7848C11.562 1.89421 11.6235 2.04269 11.6235 2.19751C11.6235 2.35233 11.562 2.5008 11.4524 2.61022L10.2157 3.84688L10.2152 3.84747Z" :fill="theme.$main_border"/>
          </svg>
          <svg v-if="mode && tabsMoreOne" class="delete-cross" width="13" height="13" viewBox="0 0 8 8"  xmlns="http://www.w3.org/2000/svg" @click.stop="deleteTab(tab.id)">
            <path
              d="M4 4.94286L1.17157 7.77129L0.228763 6.82848L3.05719 4.00005L0.228763 1.17163L1.17157 0.228817L4 3.05724L6.82843 0.228817L7.77124 1.17163L4.94281 4.00005L7.77124 6.82848L6.82843 7.77129L4 4.94286Z"
              :fill="theme.$main_border"
            />
          </svg>
        </div>
        <div v-else>
          <input v-model="tempName" class="tab-name-input" type="text" @keypress.enter="editTabName">
          <svg @click.stop.prevent="editTabName" id="submit-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.9375 14.7142L3.8125 10.5892L4.99083 9.41089L7.93875 12.3555L7.9375 12.3567L15.0083 5.28589L16.1867 6.46422L9.11583 13.5359L7.93833 14.7134L7.9375 14.7142Z" :fill="theme.$main_border"/>
          </svg>
        </div>
      </div>
      <div v-if="mode" id="plus-icon" @click="addNewTab">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 8V14H6V8H0V6H6V0H8V6H14V8H8Z" :fill="theme.$main_border"/>
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
      deltaHorizontal: 0, //сколько надо увеличить высоту overlay-grid,по первое знач-500,
      startClientHeight: 0,
      startClientWidth: 0,
      verticalCell: 0,
      horizontalCell: 0,
      tabEditMode: false,
      tempName: '',
      editableTabID: 0,
      hoveredTabID: 0,
      loadingDash: true,
      dataObject: {},
    }
  },
  computed: {
    idDash: function() {   // получаем id страницы от родителя
      return this.$route.params.id
    },
    elements: function() {  // получаем название элемента  от родителя
      return this.loadingDash ? [] : this.$store.getters.getElementsWithSearches(this.idDash)
    },
    headerTop () {
      if (document.body.clientWidth <= 1400){
        return 40
      } else {
        return 50
      }
    },
    theme () {
      return this.$store.getters.getTheme
    },
    gridShow () {
      return this.loadingDash ? false : this.$store.getters.getGridShow(this.idDash) === 'true'
    },
    getSizeGrid () {
      return this.loadingDash
        ? { hor: '18', vert: '32' }
        : this.$store.getters.getSizeGrid(this.idDash)
    },
    tabs () {
      return this.loadingDash ? [] : this.$store.getters.getDashTabs(this.idDash)
    },
    tabsMoreOne () {
      return this.tabs.length > 1
    },
    showTabs () {
      return this.loadingDash ? false : this.$store.getters.getShowTabs(this.idDash)
    },
    currentTab () {
      return this.loadingDash ? 0 : this.$store.getters.getCurrentDashTab(this.idDash)
    },
  },
  watch: {
    getSizeGrid () {
      this.calcSizeCell()
    },
    mode () {
      if (!this.mode) {
        this.editableTabID = 0
        this.tempName = ''
        this.tabEditMode = false
      }
    },
  },
  async mounted() {
    await this.checkAlreadyDash()
    document.title = `EVA | ${this.$store.getters.getName(this.idDash)}`
    this.createStartClient()
    this.calcSizeCell()
    this.addScrollListener()

    const searches = this.$store.getters.getSearches(this.idDash)

    searches.forEach(search => this.$set(this.dataObject, search.sid, { data: [], loading: true }))
    this.loadingDash = false

    await Promise.allSettled(searches.map(search => this.$store.getters.getDataApi({ search, idDash: this.idDash }).then(res => {
      this.$set(this.dataObject[search.sid], 'data', res)
      this.$set(this.dataObject[search.sid], 'loading', false)
      // this.dataObject[search.sid] = { data: res, loading: false}
    })))
    console.log(this.dataObject)
  },
  methods: {
    checkLoading(elem) {
      if (elem.search === -1) return false
      return this.dataObject[elem.search].loading
    },
    getElementData(elem) {
      if (elem.search === -1) return []
      return this.dataObject[elem.search].data
    },
    // getDataFromRest: async function(event) {
    //   // console.log(123)
    //   // this.$set(this.loadings,event.sid,true);
    //   this.$store.commit('setLoading', {search: event.sid, idDash: this.idDash, should: true, error: false });
    //
    //   this.$store.auth.getters.putLog(`Запущен запрос  ${event.sid}`);
    //   let response = await this.$store.getters.getDataApi({search: event, idDash: this.idDash}); // собственно проводим все операции с данными
    //   // вызывая метод в хранилище
    //   if ( response.length === 0) {  // если что-то пошло не так
    //     this.$store.commit('setLoading', {search: event.sid, idDash: this.idDash, should: false, error: true  });
    //   } else {  // если все нормально
    //
    //     let responseDB = this.$store.getters.putIntoDB(response, event.sid, this.idDash);
    //     responseDB
    //       .then(
    //         result => {
    //           this.$store.commit('setLoading', {search: event.sid, idDash: this.idDash, should: false, error: false  });
    //         },
    //       );
    //   }
    //   return response
    // },
    clickTab(tabID) {
      if (!this.tabEditMode) {
        this.$store.commit('changeCurrentTab', {idDash: this.idDash, tab: tabID});
      }
    },
    addNewTab() {
      if (!this.tabEditMode) {
        let tabID = [...this.tabs].sort((a, b) => b.id - a.id)[0].id + 1;
        this.$store.commit('addNewTab', {idDash: this.idDash, tabID, tabName: 'Без названия'})
      }
    },
    deleteTab(tabID) {
      if (this.tabsMoreOne && !this.tabEditMode) {
        this.$store.commit('deleteDashTab', {idDash: this.idDash, tabID});
      }
    },
    enterEditMode(tab) {
      if (!this.tabEditMode && !this.editableTabID) {
        this.tabEditMode = true;
        this.editableTabID = tab.id;
        this.tempName = tab.name;
      }
    },
    editTabName() {
      if (this.tempName) {
        this.$store.commit('editTabName', {idDash: this.idDash, tabID: this.editableTabID, newName: this.tempName})
        this.tabEditMode = false
        this.editableTabID = 0
        this.tempName = ''
      }
    },
    tabOver(tabID) {
      this.hoveredTabID = tabID
    },
    tabLeave() {
      this.hoveredTabID = 0
    },
    hash: function(elem) {
      return `${elem}#${this.idDash}`
    },
    changeMode: function() {
      this.mode = !this.mode
    },
    openSettings: function() {
      this.showSetting = !this.showSetting
    },
    setPermissions: function(event) {
      this.permissions = event
    },
    checkOver: function() {
      // this.letElements = true
      // this.checkAlreadyDash();
    },
    updateDash: function() {
      this.$store.commit('updateDash',{dash: this.alreadyDash,modified: this.alreadyDash.modified});
      this.$store.auth.getters.putLog(`Обновлен дашборд ${this.toHichName(this.alreadyDash?.name)} с id ${this.alreadyDash.id}`);
      this.alreadyShow = false;
    },
    toHichName: function(name) {
      return name[0].toUpperCase() + name.slice(1);
    },
    checkAlreadyDash: async function() {
      let response = await this.$store.getters.checkAlreadyDash(this.$route.params.id);
      if (response.status === 'exist') {
        this.alreadyShow = true;
        this.alreadyDash = response;
      }
      this.prepared = true;
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