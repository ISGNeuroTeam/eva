<template>
  <v-app 
    class="aut-app-profile" 
    :style="{background: color.back }" 
  >
    <header-top 
      :inside="true" 
      @permissions="setPermissions"
    />
    <v-content>
      <v-container  
        class="main-container" 
      >
        <v-card class="card-aut-table">
          <v-card-text :style="{background: color.backElement }">
            <v-tabs   
              v-model="tab" 
              :color="color.text"  
              @change="getData"
            >
              <v-tabs-slider />
              <v-tab  
                v-for="i in tabs.length" 
                :key="i"
                :href="`#tab-${i}`"
              >
                {{ tabs[i-1] }}
              </v-tab>
              <v-tab-item  
                v-for="i in tabs.length" 
                :key="i" 
                class="item"
                :value="`tab-${i}`" 
                :style="{background: color.backElement}"
              >
                <div 
                  v-if="dataLoading"
                  class="loading-tab" 
                >
                  <v-skeleton-loader
                    type="table-tbody"
                    tile
                    :style="{background: color.backElement}"
                  />
                </div>
                <div
                  v-if="!dataLoading"
                  class="table-tab"  
                  :style="{background: color.backElement }"
                >
                  <v-data-table
                    :style="{background: color.backElement, color: color.text, borderColor: color.text }"
                    :headers="titles"
                    :items.sync="originData"
                    :items-per-page="15"
                    class="aut-table"
                    :data-id="`${i}`"
                    :sort-by="['roles']"
                  >
                    <template v-slot:item.color="{ item }">
                      <div 
                        class="square-profile" 
                        :style="{backgroundColor:item.color}"
                      />
                    </template>
                    <template v-slot:item.actions="{ item }">
                      <v-tooltip 
                        bottom 
                        :color="color.controlsActive"  
                      >
                        <template v-slot:activator="{ on }">
                          <v-icon 
                            v-if="i == 1 ? true : showPencilRoot" 
                            v-model="item.actions"
                            class="editUser icon-aut" 
                            :color="color.controls"
                            v-on="on" 
                            @click="editUser('edit',item,i)"
                          >
                            {{ pencil }}
                          </v-icon>
                        </template>
                        <span>Редактировать</span>
                      </v-tooltip>
                      <v-tooltip 
                        bottom 
                        :color="color.controlsActive"  
                      >
                        <template v-slot:activator="{ on }">
                          <v-icon 
                            v-if="adminRool" 
                            v-model="item.actions"
                            class="editUser icon-aut" 
                            :color="color.controls"
                            v-on="on" 
                            @click="openDelete(item,i)"
                          >
                            {{ trash }}
                          </v-icon>
                        </template>
                        <span>Удалить</span>
                      </v-tooltip>
                    </template>
                  </v-data-table>
                  <v-btn
                    v-if="adminRool"
                    :color="color.controls"
                    fab
                    dark
                    small
                    absolute
                    top
                    right
                    @click="editUser('create','',i)"
                  >
                    <v-icon>
                      {{ plus }}
                    </v-icon>
                  </v-btn>
                </div>
              </v-tab-item>
            </v-tabs>
          </v-card-text>
        </v-card>
      </v-container> 
    </v-content>
    <footer-bottom />
    <modal-profile 
      :activeFrom ="activeModal" 
      :colorFrom="color" 
      :create="createSome" 
      :keyFrom="keyFrom"  
      :curItemFrom="curItem" 
      :passway="permission"  
      :userFrom="user" 
      @cancelModal="closeModal"
    />
    <modal-delete-profile 
      :activeDelete ="activeDelete" 
      :colorFrom="color" 
      :dataFrom="dataDelete" 
      @cancelModal="closeModal"
    />
  </v-app>
</template>

<script>

import {   mdiPencil,  mdiPlus, mdiTrashCanOutline  } from '@mdi/js'

import themes from '../../js/themeSettings.js';

export default {

  data () {
    return {
      user: {},
      pencil: mdiPencil,
      plus: mdiPlus,
      trash: mdiTrashCanOutline,
      tab: 'tab-1',
      adminRoot: false,
      showPencilRoot: false,
      tabs: ['Пользователи','Роли','Привилегии','Группы','Индексы'],
      essence: ['user','role','permission','group','index'],
      titles: [],
      originData: [],
      dataLoading: true,
      activeModal: false,
      activeDelete: false,
      createSome: false,
      colorRow: false,
      keyFrom: null,
      dataDelete: {},
      curItem: {},
      permission: true,
      color: { },
    } 
  },
  computed: { 
    adminRool: function() {
      return this.adminRoot
    },
    theme: function() {
      return this.$store.getters.getTheme
    }
  },  
  watch: {
    theme: function (theme) {
      this.color = themes[theme];
      
    },
  }, 
  methods: {
    setPermissions: function(event) {
      if (event.includes('admin_all')) {
        this.adminRoot = true;
        this.permission = false;
        this.showPencilRoot = true;
      } 
            
    },
    editUser: function(act,item,key) {
      if (act == 'create') { 
        this.user = {};
        this.createSome = true;
      } else { 
        this.user = item;
        this.createSome = false;

      }
      this.curItem = item;
      this.keyFrom = key;

      if (act!='create') {
        switch(key){
        case 1:
          this.curItem.tab = 'user';
          break
        case 2:
          this.curItem.tab = 'role';
          break
        case 3:
          this.curItem.tab = 'permission';
          break
        case 4:
          this.curItem.tab = 'group';
          break
        case 5:
          this.curItem.tab = 'index';
          break
        }
      }
      this.activeModal = true;
    },
    getData: async function(event) {
      this.dataLoading = true;
      this.titles = this.setTitles(Number(event.split('-')[1]));
      this.originData = await this.setData(Number(event.split('-')[1]));
      if(this.originData.length) {
        this.originData.forEach( (item,i) => {
          Object.keys(item).forEach( itemopt => {
            if (Array.isArray(item[itemopt])) {
              this.originData[i][itemopt] = this.checkName(item[itemopt].join(', '));
            }
          })
        });
        this.setColorHover(event.split('-')[1]);
      } else {
        this.originData = [];
      }
                
      this.dataLoading = false;

    },
    setTitles: function(role) {
      let titles = [];
      switch(role) {
      case 1:
        titles =     [
          { text: 'Логин',  value: 'name',},
          { text: 'Роли', value: 'roles' },
          { text: 'Группы', value: 'groups' },
          { text: '', value: 'actions' },
        ]
        break
      case 2:
        titles =     [
          { text: 'Название',  value: 'name',},
          { text: 'Пользователи', value: 'users' },
          { text: 'Привилегии', value: 'permissions' },
          { text: '', value: 'actions' },
        ]
        break
      case 3:
        titles =     [
          { text: 'Название',  value: 'name',},
          { text: 'Роли', value: 'roles' },
          { text: '', value: 'actions' },
        ]
        break
      case 4:
        titles =     [
          { text: 'Название',  value: 'name',},
          { text: 'Цвет', value: 'color' },
          { text: 'Индексы', value: 'indexes' },
          { text: '', value: 'actions' },
        ]
        break
      case 5:
        titles =     [
          { text: 'Название',  value: 'name',},
          { text: 'Группы', value: 'groups' },
          { text: '', value: 'actions' },
        ]
        break
      }
      return titles;
    },
    setData: async function(role) {
      return await this.$store.auth.getters.getEssenceList(role,false)
    },
    setColorHover: function(i) { 

      let table = {};
      let timeOut = setTimeout( async function tick() {
      
        if (document.querySelector(`[data-id="${i}"]`)) {
          clearTimeout(timeOut);
          table = document.querySelector(`[data-id="${i}"]`);
          table.addEventListener('mouseover', event => {
            if(event.target.tagName.toLowerCase() == 'td') {
              event.target.parentElement.style =`background: ${this.color.controlsActive} !important;color:${this.color.back}`;
            }
          })
          table.addEventListener('mouseout', event => {
            if(event.target.tagName.toLowerCase() == 'td') {
              event.target.parentElement.style =`background: transparent !important;color:${this.color.text}`;
            }
          })

        }  else {
          timeOut = setTimeout(tick.bind(this), 100); 
        }
      }.bind(this), 0);
      
    },
    checkName: function(name) {
      if (name.length > 25) {
        return name.slice(0, 25) + '...'
      }
      return name
    },
    openDelete: function(item,i) {
      let text = '';
      this.keyFrom = i;
      switch(i){
      case 1:
        text = `<p>Удалить пользователя</p> `;
        break
      case 2:
        text = `<p>Удалить роль</p> `;
        break
      case 3:
        text = `<p>Удалить привилегию</p> `;
        break
      case 4:
        text = `<p>Удалить группу</p> `;
        break
      case 5:
        text = `<p>Удалить индекс</p> `;
        break
      }
      this.dataDelete.text = `${text} <span>${item.name}</span>`;
      this.dataDelete.id = item.id; 
      this.dataDelete.essence = i;
      this.activeDelete = true;
    },
    closeModal: function() {
      this.activeDelete = false;
      this.activeModal = false;
      this.getData(`tab-${this.keyFrom}`);
    },
  },
  mounted() {
    this.getData('tab-1');
    this.color = themes[this.theme];
  } 
}


</script>

<style lang="sass" > 
  
   @import '../../sass/profile.sass'

</style>