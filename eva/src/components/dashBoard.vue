<template>
  <div 
    class="dash-layout" 
    :options="String(options)" 
    :class="{show_board:props.differentOptions.visible}" 
    :style="{boxShadow:` 0 0 5px 5px ${props.optionsBoxShadow}`}" 
  > 
    <v-card  
      class="dash-block"  
      :style="{background:color.backElement, boxShadow:`0 3px 1px -2px ${color.border},0 2px 2px 0 ${color.border},0 1px 5px 0 ${color.border}`}"
    >   
      <v-card-title 
        v-show="props.disappear"
        class="card-title open_title"
      >
        <div class="name-dash">
           <v-icon 
            v-if="dataFromDB"
            class="icon"
            :color="color[setColorDS]"
          >
            {{ mdiDatabaseSearch }}
          </v-icon>
          <v-icon 
            v-show="dataMode"
            class="icon chart" 
            :color="color.controls"
          >
            {{ props.icons[elemIcon] }}
          </v-icon>
          <div class="dash-capture">
            <div
              v-if="props.edit"
              class="dash-title"  
              :style="{color:color.text}"
            >
              {{ props.name }}
            </div>
            <div 
              v-if="props.edit" 
              v-show="dataMode"
              class="dash-block-id"  
              :style="{color:color.text}"
            >
              [ {{ element }} ]
            </div>
            <div 
              v-if="props.edit" 
              v-show="dataMode"
              class="dash-block-sid"  
              :style="{color:color.text, borderColor:color.text}"
            >
              {{ props.sid }}
            </div>
            <v-text-field 
              v-if="!props.edit" 
              v-show="dataMode"
              v-model="props.name" 
              clearable 
              :color="color.text" 
              :style="{color:color.text}" 
              class="dash-edit-title" 
              hide-details 
            />             
          </div>
        </div>
        <div class="settings-dash-block" v-show="dataMode">
          <div 
            class="settings-dash" 
            :class="{settings_move:props.open_gear}"
          >
            <v-tooltip 
              bottom 
              :color="color.controlsActive"
            > 
              <template v-slot:activator="{ on }"  >
                <v-icon 
                  class=" datasource" 
                  :color="color[setColorDS]" 
                  v-on="on" 
                  @click="switchDS(props)"
                >
                  {{ props.mdiDatabase }}
                </v-icon>
              </template>
              <span>Источник данных</span>
            </v-tooltip>
            <v-tooltip 
              v-if="props.edit_icon"
              bottom  
              :color="color.controlsActive"
            >
              <template v-slot:activator="{ on }">
                <v-icon 
                  class="pencil" 
                  :color="color.controlsInsideDash" 
                  v-on="on" 
                  @click="() => {props.edit=false; props.edit_icon=false; }"
                >
                  {{ props.mdiPencil }}
                </v-icon> 
              </template>
              <span>Переименовать</span>
            </v-tooltip>
            <v-tooltip 
              v-if="!props.edit_icon"
              bottom 
              :color="color.controlsActive"
            >
              <template v-slot:activator="{ on }">
                <v-icon 
                  class=" check"
                  :color="color.controlsActive"  
                  v-on="on"  
                  @click="editName(props)"
                >
                  {{ props.mdiCheckBold }}
                </v-icon>
              </template>
              <span>Переименовать</span>
            </v-tooltip>
            <v-tooltip 
              bottom 
              :color="color.controlsActive"
            >
              <template v-slot:activator="{ on }">
                <v-icon 
                  class=" option"  
                  :color="color[setColorOp]"  
                  v-on="on" 
                  @click="switchOP()"
                >
                  {{ props.mdiSettings }}
                </v-icon>
              </template>
              <span>Настройки</span>
            </v-tooltip>
            <v-tooltip 
              bottom 
              :color="color.controlsActive"
            >
              <template v-slot:activator="{ on }">
                <v-icon 
                  class=" delete" 
                  :color="color.controlsInsideDash"
                  v-on="on" 
                  @click="deleteDashBoard(props)"
                >
                  {{ props.mdiTrashCanOutline }}
                </v-icon>
              </template>
              <span>Удалить</span>
            </v-tooltip>
          </div>
        </div>
      </v-card-title>
      <div 
        v-if="!props.hideLoad"
        class="loading-block"
      >
        <div 
          v-show="props.disappear"
          :style="{borderColor:color.text, opacity: '0.2'}"   
          class="loading-divider" 
          :class="{loading:loadingSearch,loading:props.loading,noBorder:!dataMode}" 
        >
          <div 
            class="loading-bar " 
            :style="{background: color.controlsActive}" 
          />
        </div>
      </div>
      <v-card-text 
        v-show="!showElement"
        class="card-text"  
      >
        <button 
          class="selectDS" 
          :style="{color: 'white', background: color.controls}" 
          @click="chooseDS()"
        >
          Выберите источник данных
        </button>
      </v-card-text>
      <!--  Здесь подключаем элементы визуализации -->
      <v-card-text 
        :is="currentElem" 
        v-show="showElement"
        class="card-text element-itself" 
        :colorFrom="color" 
        :style="{color:color.text, background:'transparent'}"  
        :idFrom="element"   
        :idDashFrom="idDash"  
        :dataRestFrom="props.dataRestFilter" 
        :dataModeFrom="dataMode" 
        :shouldFrom="shouldGet" 
        :timeFormatFrom="props.timeFormat"  
        :sizeTileFrom="props.sizeTile" 
        :tooltipFrom="props.tooltip"  
        :widthFrom="width" 
        :heightFrom="height"  
        @hideDS="hideDS($event)" 
        @setVissible="setVissible($event)" 
        @setLoading="setLoading($event)" 
        @hideLoading="props.hideLoad = true"
      />
      <!-- ------------>
    </v-card>
  </div> 
</template>

<script>

import { mdiPencil,mdiCheckBold, mdiClose,  mdiArrowAll, mdiArrowExpandAll,  mdiCodeTags, mdiTrashCanOutline, mdiDatabase, mdiSettings, mdiChevronDown, mdiChevronUp, mdiDatabaseSearch } from '@mdi/js'

import  settings  from '../js/componentsSettings.js'

export default {
  props: {
    colorFrom: null,
    width: null,
    height: null,
    idDashFrom: null,
    dataElemFrom: null,
    dataModeFrom: null,
    dataPageFrom: null,
  },
  data () {
    return {
      dataFromDB: true,
      mdiDatabaseSearch: mdiDatabaseSearch,
      props: {
        id: '', 
        sid: '', 
        name: '',
        mdiPencil: mdiPencil,
        mdiCheckBold: mdiCheckBold ,
        mdiClose: mdiClose,
        mdiArrowAll: mdiArrowAll,
        mdiArrowExpandAll: mdiArrowExpandAll,
        mdiCodeTags: mdiCodeTags,
        mdiTrashCanOutline: mdiTrashCanOutline,
        mdiDatabase: mdiDatabase,
        mdiSettings: mdiSettings,
        mdiChevronUp: mdiChevronUp,
        mdiChevronDown: mdiChevronDown,
        icons: {},
        edit: true,
        edit_icon: true,
        move_elem: true,
        resize_elem: true,
        datasource_elem: true,
        showOptions: true,
        arrow_coral: 'controlsInsideDash',
        resize_arrow_coral: 'controlsInsideDash',
        code_coral: 'fill:teal',
        transition: true,
        element: '',
        page: '',
        dataRest: [],
        dataRestFilter: [],
        loading: false,
        open_gear: true,
        arrow: {
          direct: 'down',
          elem: mdiChevronDown
        },
        open_title: false,
        options: {
          visible: true,
          change: false,
          level: 1,
          boxShadow: false,
        },
        optionsBoxShadow: 'transparent',
        differentOptions: {
          visible: true,
        },
        disappear: true,
        timeFormat: '',
        sizeTile: {},
        hideLoad: false,
        tooltip: {},
        metricsMulti: [],
      }
    }
  },
  asyncComputed: {
    async prepareData() {  // подготавливаем данные для отображения
      if (this.shouldGet) {
       
        let searchId = this.$store.getters.getSearchID({idDash: this.idDash, id: this.element});
        let searchName = `${this.idDash}-${searchId}`;
        let search = this.$store.getters.getSearch({idDash: this.idDash, id: this.element});
        if  (searchId == -1) {
          this.props.sid = ''
        } else { 
          this.props.sid = searchId
        }

        let fromDB
        this.dataFromDB = true
        this.getDataFromDB(searchName).then(result=>{
          fromDB = result
          this.props.dataRestFilter = fromDB;
        })

        this.getDataFromRest(search)
          .then(result=>{
            this.props.dataRestFilter = result
            this.dataFromDB = false
            if(result.length===0 && this.lastResult){
              this.props.dataRestFilter = fromDB
            }
          },
          () => {
            if(this.lastResult){
              this.props.dataRestFilter = fromDB
            } else {
              this.props.dataRestFilter = []
            }
          }
          )
      }
      this.$store.commit('setShould', { idDash: this.idDash,  id: this.element, status: false});         
               
    },
  },
  computed: {
    idDash: function() { // получаем id страницы от родителя 
      return this.idDashFrom
    },
    element: function() {  // получаем название элемента
      return this.dataElemFrom
    },
    dataMode: function() {
      this.changeOptions(this.dataModeFrom);
      if (!this.dataModeFrom) {
        if (this.element.split('-')[0] == 'button' || this.element.split('-')[0] == 'csvg' || this.element.split('-')[0] == 'tile') {
          this.props.disappear = false;
        }
      } else {
        this.props.disappear = true;
      }
      return this.dataModeFrom
    },
    color: function() {
      return this.colorFrom
    },
    currentElem: function() { // создаем некий тег элемнета который хотим добавтиь чтобы он был вида типа dash-table
      let nameElement = '';
      if (this.element) {
        let element = this.element.split('-')[0];
        nameElement = `dash-${element}`;
      }    
      return nameElement
    },
    loadingSearch: function() {
      this.setLoading(this.$store.getters.getLoading( this.element, this.idDash));
      return this.$store.getters.getLoading( this.element, this.idDash);
    },
    elemIcon: function() {
      let element = '';
      if (this.element) {
        element = this.element.split('-')[0];
      } 
      return element  
    },
    setColorDS: function() {  // переключаем цвет иконок
      if (!this.showElement){
        return 'controlsActive';
      } else {
        return  'controlsInsideDash';
      }
    },
    setColorOp: function() {  // переключаем цвет иконок
      if (!this.props.showOptions){
        return 'controlsActive';
      } else {
        return  'controlsInsideDash';
      }
    },
    showElement: function() {  // понимаем нужно ли переключать элемент между выбором ИС и самими данными '
      let show = false;
      if (this.element) {
        show = this.$store.getters.getSwitch({idDash: this.idDash, id: this.element});
      }
      return show
    },
    shouldGet: function() {  // понимаем нужно ли запрашивтаь данные с реста
      let should = false;
      if (this.element){
        should =  this.$store.getters.getShouldGet({id: this.element, idDash: this.idDash});
      }
      return should
    },
    lastResult: function () {
      let options = this.$store.getters.getOptions({
        idDash: this.idDash,
        id: this.element,
      });
      return options.lastResult;
    },
    options: function() {
      
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.element});
              
      Object.keys(options).forEach( item => {
        this.props.options[item] = options[item];
      })

      if (this.props.options.timeFormat) {
        this.props.timeFormat = this.props.options.timeFormat;
      }
      if (this.props.options.widthTile) {
        this.$set(this.props.sizeTile,'width',this.props.options.widthTile);
      } else {
        this.$set(this.props.sizeTile,'width','');
      }
      if (this.props.options.heightTile) {
        this.$set(this.props.sizeTile,'height',this.props.options.heightTile);
      }  else {
        this.$set(this.props.sizeTile,'height','');
      }
      if (this.props.options.tooltip) {
        Object.keys(this.props.options.tooltip).forEach( item => {
          this.$set(this.props.tooltip,item,this.props.options.tooltip[item]);
        })
      } else {
        this.$set(this.props.tooltip,'texts',[]);
        this.$set(this.props.tooltip,'links',[]);
        this.$set(this.props.tooltip,'buttons',[]);
      }

      this.$emit('SetLevel',this.props.options.level)
          
      this.setShadow();

      return options.change
    }
  },
  methods: {
    editName: function (props) {  // изменяем имя элемнета
      props.edit=true; 
      props.edit_icon=true;
      this.$store.commit('setNameDash', {name: props.name, id: this.element, idDash: this.idDash });
    },
    chooseDS: function() {  // открываем модальное окно с выбором ИС (источник данных)
      this.$store.commit('setModalSearch',  { id: this.idDash, status: true, elem: this.element } );
    },
    switchDS: function ( ) {  // переключаем между режимами выбора данных и их отображением
      let status = !this.showElement;
      this.$store.commit('setSwitch',  { idDash: this.idDash, status: status, id: this.element } );
    },
    switchOP: function() {
      this.$store.commit('setModalSettings',  { idDash: this.idDash, status: true, element: this.element } );
    },
    setShadow: function() {
      if (this.props.options.boxShadow) {
        this.props.optionsBoxShadow =  this.color.controlsActive;
      } 
      else{ 
        this.props.optionsBoxShadow =  `transparent`;
      }
    },
    setLoading: function(event) {
      if (this.element.indexOf('button') != -1) {
        this.props.hideLoad = !event;
      }
      this.props.loading = event;
    },
    deleteDashBoard: function ( props ) { // вызываем окно для удаления элемнета
      this.$store.commit('setModalDelete', { id: this.idDash, status: true, elem: this.element, name: props.name, page: this.dataPageFrom}); 
    },
    getDataFromDB: function(searсhID) {   // получение данных с indexindDB

    
      let db = null;
    
      let request = indexedDB.open("EVA",1);  


      request.onerror = function(event) {
        console.log("error: ",event);
      };

      request.onupgradeneeded = event => {
        console.log('create');
        db = event.target.result;
        if (!db.objectStoreNames.contains('searches')) { // if there's no "books" store
          db.createObjectStore('searches'); // create it
        }

        request.onsuccess = event => {
          db = request.result;
          console.log("successEvent: " + db);
        };

      }


      let promise = new Promise((resolve, reject) => {


        request.onsuccess =  event => {

          db = request.result;

          let transaction = db.transaction("searches"); // (1)

          // получить хранилище объектов для работы с ним
          let searches = transaction.objectStore("searches"); // (2)



          let query = searches.get(String(searсhID)); // (3) return store.get('Ire Aderinokun');

          query.onsuccess = event => { // (4)
            if (query.result) {
              resolve(query.result);
            } else {
              resolve([])
            }
          };

          query.onerror = function() {
            console.log("Ошибка", query.error);
          };                   

        };    

      });

      return promise
      
    },
    openTitle: function() {  // открываем закрываем шапку элемнета
      if(this.props.arrow.direct == "up") {
        this.props.arrow.elem = this.props.mdiChevronDown;
        this.props.arrow.direct = "down";
      }  else {
        this.props.arrow.elem = this.props.mdiChevronUp;
        this.props.arrow.direct = "up";
      }
      this.props.open_title = !this.props.open_title;
    },
    hideDS: function() {  // функция которая для определенного элемента сразу вносит ряд настроек визуализации=
      this.$store.commit('setSwitch',  { idDash: this.idDash, status: true, id: this.element } ) ;  // сразу переключаем элемнет на отображение данных,
    },
    setVissible: function(event){
      if (event.split('-')[0] == 'picker' || event.split('-')[0] == 'guntt') {   // собственно если элемнет выбора даты и времен
        // поскольку запроса данных никакого не надо
        this.$el.querySelector('.dash-block').style.overflow ='visible'; // и еще меняем скрытие элемнета,  чтобы раскрывающийся список вылазхил из него
      }
    },
    changeOptions: function(mode) {
      let level = this.props.options.level;
      let opacity = 1;
      if(mode) {
        this.props.differentOptions.visible = true;
      } else {
        if (!this.props.options.visible) {
          this.props.differentOptions.visible = false;
          opacity = 0;
        } else {
          this.props.differentOptions.visible = true;
          opacity = 1;
        }
      }
      this.$emit('SetOpacity',opacity);
      this.$emit('SetLevel',level);
    },
    getDataFromRest: async function(event) {

      // this.$set(this.loadings,event.sid,true);
      this.$store.commit('setLoading', {search: event.sid, idDash: this.idDash, should: true, error: false }); 
    
      this.$store.auth.getters.putLog(`Запущен запрос  ${event.sid}`);
      let response = await this.$store.getters.getDataApi({search: event, idDash: this.idDash}); // собственно проводим все операции с данными
      // вызывая метод в хранилище
      if ( response.length == 0) {  // если что-то пошло не так 
        this.$store.commit('setLoading', {search: event.sid, idDash: this.idDash, should: false, error: true  });  
      } else {  // если все нормально

        let responseDB = this.$store.getters.putIntoDB(response, event.sid, this.idDash);
        responseDB
          .then(
            result => {
              this.$store.commit('setLoading', {search: event.sid, idDash: this.idDash, should: false, error: false  }); 
            },
          );
      }
      return response
    },
  },
  mounted() {
    this.props.icons = settings.icons;
    this.page = this.$parent.$el.getAttribute('data-page');  // понимаем какая страница перед нами
    this.props.name = this.$store.getters.getNameDash({idDash: this.idDash, id: this.element}); // получаем имя этой страницы

    if (this.props.options.boxShadow) {
      this.props.optionsBoxShadow = this.color.controlsActive;
    } else {
      this.props.optionsBoxShadow = 'transparent';
    }

    this.$store.commit('setShould', { idDash: this.idDash,  id: this.element, status: true});
      
  }   
}


</script>

<style lang="sass" > 
  
    @import '../sass/dashBoard.sass'
   
  
</style>