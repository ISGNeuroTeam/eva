<!-- Модальное окно для создания дашборда -->

<template>
  <v-dialog  
    v-model="active"  
    width="90%"  
    persistent 
    @keydown="checkEsc($event)" 
  > 
    <div 
      v-if="groupCheck"
      class="create-modal-block-group"  
    >
      <v-card :style="{background:theme.$main_bg}">
        <v-card-text class="headline ">
          <div 
            class="create-title" 
            :style="{color:theme.$title}"
          >
            {{ nameTitle }}
          </div>
        </v-card-text>
        <div class="create-block">
          <v-text-field 
            v-model="newGroup.name"
            hide-details  
            class="input-create"  
            :style="{color:theme.$main_text}"
            :background-color="theme.$main_bg"
            label="Имя группы" 
            :color="theme.$primary_button"
            outlined  
            clearable  
          />
          <div 
            class="zagolovok-field input-create"  
            :style="{color:theme.$main_text}"
          >
            Цвет группы
          </div>
          <v-color-picker
            v-model="newGroup.color" 
            class="colorPicker input-create" 
          />
          <div class="profile-block">
            <data-profile 
              v-for="item in Object.keys(group.tab)" 
              :key="item"   
              essence="group" 
              :dataFrom="dataRest" 
              :subessence="item" 
              :colorFrom="theme"
              :create="actionFrom"  
              :activeFrom="modalFrom" 
              @changeData="changeData"
            />
          </div> 
          <div 
            class="warn" 
            :class="{showwarning:showwarning}" 
            :style="{color:theme.$accent_ui_color}"
          >
            {{ nameWarn }}
          </div>
          <v-card-actions>
            <v-spacer />
            <v-btn 
              small 
              :color="theme.$primary_button"
              class="create-btn"
              @click="createBtn(newGroup.name)"
            >
              {{ nameBtn.create }}
            </v-btn>
            <v-btn 
              small 
              :color="theme.$primary_button"
              class="create-btn" 
              @click="cancelModal(nameBtn.cancel)"
            >
              {{ nameBtn.cancel }}
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </div>
    <div 
      v-if="!groupCheck"
      class="create-modal-block-group" 
      :class="{create_warning:create_warning}"
    >
      <v-card :style="{background:theme.$main_bg}">
        <v-card-text class="headline ">
          <div 
            class="create-title" 
            :style="{color:theme.$main_text}"
          >
            {{ nameTitle }}
          </div>
        </v-card-text>
        <div class="create-block">
          <v-text-field 
            v-model="newDash.name" 
            hide-details  
            class="input-create" 
            :style="{color:theme.$main_text}"
            :background-color="theme.$main_bg"
            label="Имя дашборда" 
            :color="theme.$accent_ui_color"
            outlined  
            clearable  
          />
          <div class="profile-block">
            <data-profile   
              essence="dash" 
              subessence="groups" 
              :nameGroupFrom="nameGroupFrom" 
              :dataFrom="dataRest" 
              @changeData="changeData"  
              :create="actionFrom" 
              :colorFrom="theme"
              :activeFrom="modalFrom" 
            />
          </div>
          <div 
            class="warn" 
            :class="{showwarning:showwarning}" 
            :style="{color:theme.$accent_ui_color}"
          >
            {{ nameWarn }}
          </div>
          <v-card-actions>
            <v-spacer />
            <v-btn 
              small 
              :color="theme.$primary_button"
              class="create-btn" 
              @click="createBtn(newDash.name)"
            >
              {{ nameBtn.create }}
            </v-btn>
            <v-btn 
              small 
              :color="theme.$primary_button"
              class="create-btn" 
              @click="cancelModal(nameBtn.cancel)"
            >
              {{ nameBtn.cancel }}
            </v-btn>
          </v-card-actions>
        </div>
      </v-card>
    </div>
  </v-dialog>
</template>

<script> 


export default {
  props: {
    modalFrom: null,
    groupFlagFrom: null,
    groupFrom: null,
    dashsFrom: null,
    actionFrom: null,
    dataFrom: null,
    dashFrom: null,
    curGroupFrom: null,
    nameGroupFrom: null,
  },
  data () {
    return {
      name: '',
      newDash: {
        name: '',
        id: '',
      },
      newGroup: {
        name: '',
        color: ''
      },
      nameBtn: {
        create: 'Создать',
        cancel: 'Отмена'
      },
      nameTitle: '',
      nameWarn: 'Имя не может быть пустым',
      showwarning: false,
      newLayout: {},
      create_warning: false,
      dataRest: {},
      changedData: {},
      group: {
        tab: {
          users: null,
          dashs: null,
          indexes: null,
        },
      },
      dash: {
        tab: {
          groups: null,
        },
      },
    }
  },
  computed: {
    theme: function() {
      return this.$store.getters.getTheme
    },
    active: function() {  // тут понимаем нужно ли открыть окно с созданием или нет  
      if (this.modalFrom ) {
        if (this.dataFrom) {
          this.newGroup.name = this.dataFrom.name;
          this.newGroup.color = this.dataFrom.color;
        } else {
          this.newGroup.name = '';
          this.newGroup.color = '';
        }
        if (this.dashFrom) {
          this.newDash.name = this.dashFrom.name;
          this.newDash.id = this.dashFrom.id;
        } else {
          this.newDash.name = ''
        }
        if (this.actionFrom){
          if (this.groupCheck) {
            this.nameTitle = 'Создать новую группу';
          } else {
            this.nameTitle = 'Создать новый дашборд';
          }
          this.nameBtn.create = 'Создать';
            
        } else {
          if (this.groupCheck) {
            this.nameTitle = 'Редактировать группу';
          } else {
            this.nameTitle = 'Редактировать дашборд';
          }
          this.nameBtn.create = 'Редактировать';
        }
        this.dataRest = this.getDataForEssence();  
      }
      return this.modalFrom
    },
    groupCheck: function() { 
      return this.groupFlagFrom
    },
    groups: function() {
      return this.groupFrom
    },
    dashs: function() {
      return  this.dashsFrom
    }
  },
  methods: {  
    createBtn: function (name) {  // при нажатии на кнопку создать 
      let flag = false;
      if (!name || name == '') {  //  если пользователь не ввел имя
        this.showwarning = true;  //  показываем предупреждение
        setTimeout( () => { this.showwarning = false;},3000); // а через три секунды убираем - чисто понты)
      } else  {  // если имя введено
        //let actionEmit = '';
        let dataObj = {};
        let warnText = '';
        let essence = '';
        if (this.groupCheck) {
          this.groups.forEach( item => {  // для этого просматриваем все дашборды на странице (но берем их из хранилища)
            item.name.toLowerCase() == name.toLowerCase() ? flag = true: false 
          });
          dataObj = {name: this.newGroup.name, color: this.newGroup.color, };
          if (Object.keys(this.changedData).length != 0) {
            let keys = this.changedData.group;
            Object.keys(keys).forEach( item => {
              dataObj[item] = keys[item];
            })
          }
          if (this.curGroupFrom != -1) {
            dataObj.id = this.groupFrom[this.curGroupFrom].id;              
          }
          essence = 'group';
          warnText = 'Такая группа уже существует. Хотите изменить её?'
        } else {
          this.dashs.forEach( item => {  // для этого просматриваем все дашборды на странице (но берем их из хранилища)
            item.name.toLowerCase() == name.toLowerCase() ? flag = true: false 
          });          
          dataObj = {name: this.newDash.name,};

          if (this.newDash.id != '') {
            dataObj.id = this.newDash.id; 
          }
          dataObj.idgroup = this.curGroupFrom;

          if (Object.keys(this.changedData).length != 0) {
            let keys = this.changedData.dash;
            Object.keys(keys).forEach( item => {
              dataObj[item] = keys[item];
            })
          } 
          essence = 'dash';
          warnText = 'Такой дашборд уже существует. Хотите изменить его?'
        }
        if (!flag) { // если такого дашборда еще нет
          this.createEssence(dataObj,"POST",essence);
          this.showwarning = false;  //  показываем предупреждение
          this.nameBtn.create = 'Создать';
          this.nameBtn.cancel = 'Отмена';
          this.nameWarn = '';
        } else {  // а иначе 
          if (this.nameBtn.create != 'Да') {
            this.showwarning = true;  //  показываем предупреждение
            this.nameBtn.create = 'Да';
            this.nameBtn.cancel = 'Нет';
            this.nameWarn = warnText;
          } else {
            this.createEssence(dataObj,"PUT",essence);
            this.showwarning = false;  //  показываем предупреждение
            this.nameBtn.create = 'Создать';
            this.nameBtn.cancel = 'Отмена';
            this.nameWarn = '';
          }
        }
      }
    },
    cancelModal: function(btn) {  // есл инажали на отмену создания
      if (btn == "Отмена") {
        this.$emit('closeModal');  // передаем в родителя чтобы выключили модалку
        this.name = '';  // очищаем имя
      } 
      this.showwarning = false;
      this.nameBtn.create = 'Создать';
      this.nameBtn.cancel = 'Отмена';
      this.nameWarn = 'Имя не может быть пустым';
    },
    checkEsc: function(event) {
      if (event.code =="Escape") {
        this.cancelModal("Отмена");
      }
    },
    yesDashBoards: function() {  // если нажали на кнпку подстверждения создания дашборда
      this.createObj(this.name);  // создаем его
      this.create_warning = false;  // убаирем предупреждение
    },
    noDashBoards: function() {  // если нажали на отмену
      this.create_warning = false;  // просто убираем предупреждение
    },
    createEssence: function(group,method,essence) {
      let response =  this.$store.auth.getters.setEssence({formData: JSON.stringify(group), essence: essence,method: method});
      response.then( res => {
        if (res.status == 200){
          if (essence == 'dash') {
            res.json().then (data => {
              this.createDash({id: data.id, name: group.name, idgroup: group.idgroup, modified: data.modified});
            }) 
          }
          this.$emit('closeModal');  // передаем в родителя чтобы выключили модалку
        } else if (res.status == 409) {
          this.showwarning = true;  //  показываем предупреждение
          essence == 'group' ? this.nameWarn = 'Такая группа уже есть.' : this.nameWarn = 'Такой дашборд уже есть.';
          setTimeout( () => {
            this.showwarning = false;
          },2000);
        }
      })
    },
    createDash: function(dash) {
      this.$store.commit('setDash',{data: dash,getters:this.$store.getters.checkAlreadyDash});
      this.$store.auth.getters.putLog(`Создан дашборд ${this.toHichName(dash.name)} с id ${dash.id}`);
    },
    toHichName: function(name) {
      return name[0].toUpperCase() + name.slice(1);
    },
    getDataForEssence: async  function() {
      let role = '';
      let data = '';
      if (this.groupCheck) {
        role = 'group';
        data = this.groups;
      } else {
        role = 'dash';
        data = this.dashs;
      } 
      if (this.actionFrom) {
        let allData = {};
        let keys =[];
        let promise = Object.keys(this.$data[role].tab).map(  item => {
          keys.push(item);
          return this.$store.auth.getters.getEssenceList(item,true);
        })
        let result =  await Promise.all(promise);
        result.forEach( (item,i) => {
          allData[keys[i]] = item;
        })        
        return allData
      } 
      return this.$store.auth.getters.getEssence(role,data[this.curGroupFrom].id)

    },
    setEnter: function(event) {
      if(event.code == "Enter"){
        this.createBtn();
      }
    },
    // changeStyle: function() {
    //   if (this.active) {
    //     let dialog = document.querySelector('.v-dialog');
    //     dialog.style.boxShadow = `0 3px 1px -2px ${this.color.border},0 2px 2px 0 ${this.color.border},0 1px 5px 0 ${this.color.border}`;
    //     dialog.querySelectorAll('.v-input__slot').forEach( item => {
    //       item.style.boxShadow = `0 3px 1px -2px ${this.color.border},0 2px 2px 0 ${this.color.border},0 1px 5px 0 ${this.color.border}`;
    //     })
    //     dialog.querySelectorAll('input').forEach( item => {
    //       item.style.color = this.color.text;
    //     })
    //   }
    // },
    changeData: function(event) {
      if (!this.changedData[event.essence]) {
        this.changedData[event.essence] = {}; 
      }
      this.changedData[event.essence][event.subessence] = event.data;
    }
  },
  mounted() {
    this.create_warning = false; // выключаем все предупреждения что были включены
  },
}
</script>

<style lang="scss" > 


    @import '../sass/modalCreate.sass'

    
</style>