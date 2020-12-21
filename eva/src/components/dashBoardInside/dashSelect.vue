<template>
  <div class="dash-select">
    <div 
      v-if="show" 
      ref="selectBlock"
      class="select-with-data" 
    >
      <div class="arrow-block">
        <v-icon 
          v-if="!open" 
          class=" arrow-down arrows-select" 
          :color="color.controls" 
          @click="openSelect"
        >
          {{ down }}
        </v-icon>
        <v-icon 
          v-if="open"
          class="arrow-up arrows-select" 
          :color="color.controlsActive" 
          @click="openSelect"
        >
          {{ up }}
        </v-icon>
      </div>
      <div 
        class="source"  
        :class="{source_show:source_show}" 
        :style="{width:widthInput}" 
      >
        <v-select  
          v-model="elem"
          :items="dataRest" 
          :color="color.controls" 
          :style="{color:color.text, fill: color.text}"  
          :data-elem="dataelem" 
          hide-details  
          outlined 
          class="select-parent"  
          :loading="dataLoading" 
          label="Столбец данных"
          @change="getItem('elem')"
          @click="changeColor"
        /> 
        <v-select  
          v-model="elemlink" 
          :items="dataRest" 
          :color="color.controls" 
          :style="{color:color.text, fill: color.text}" 
          :data-elem="dataelemlink"
          hide-details  
          outlined 
          class="select-parent"  
          label="Связанный столбец данных"
          :loading="dataLoading" 
          @change="getItem('elemlink')"
          @click="changeColor"
        /> 
      </div>
      <div 
        ref="targetBlock"
        class="target" 
        :style="{width:widthInput,borderColor:color.border}" 
        :class="{select_show:select_show}"
      > 
        <v-autocomplete 
          v-model="elemDeep[String(multiple)]" 
          :items="dataRestDeep"  
          solo 
          flat 
          :multiple="multiple"    
          :style="{color:color.text, fill: color.text}"
          :color="color.controls" 
          :data-elem="dataelemDeep" 
          hide-details  
          class="select"
          label="Значение"  
          @change="setTocken"
          @click="changeColor" 
        >
          <template 
            v-if="multiple"
            v-slot:prepend-item 
          >
            <v-list-item
              ripple
              @click="selectItems"
            >
              <v-list-item-action>
                <v-icon :color="elemDeep[String(multiple)].length > 0 ? color.controls : color.text">
                  {{ chooseIcon }}
                </v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>
                  {{ chooseText }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-divider class="mt-2" />
          </template>  
        </v-autocomplete> 
      </div> 
    </div>
    <div 
      v-if="!show"
      class="error-msg" 
    >
      {{ message }}
    </div>
  </div>
</template>


<script> 

import { mdiArrowDownBoldBoxOutline, mdiArrowUpBoldBoxOutline, mdiCropSquare, mdiSquare   } from '@mdi/js'; 


export default {
  props: {
    idFrom: null,
    idDashFrom: null,
    dataRestFrom: null,
    colorFrom: null,
    dataLoadingFrom: null,
    widthFrom: null,
  },
  data () {
    return {  
      message: '',
      show: true,
      elem: "Выберите столбец данных",
      elemlink: "Выберите связанный столбец данных",
      elemDeep: {
        'true': [],
        'false': '',
      },
      topArray: [],
      bottomArray: [],
      open: true,
      down: mdiArrowDownBoldBoxOutline,
      up: mdiArrowUpBoldBoxOutline,
      source_show: true,
      select_show: false,
      dataFromRest: {},
      legends: {},
      chooseText: 'Выбрать все',
      chooseIcon: mdiCropSquare,
      actions: [
        {name: 'click',
          capture: []
        },
        {name: 'change',
          capture: []
        },
        {name: 'mouseover',
          capture: []
        },
      ],
    } 
  },
  computed: {
    id: function() { 
      return this.idFrom
    },
    idDash: function() { 
      return this.idDashFrom
    },
    dataReady: function() {
      let data = [];
      if (this.dataRestFrom != null) {
        data = this.dataRestFrom;
      } 
      return data
    },
    color: function() {
      return this.colorFrom
    },
    widthInput: function() {
      return `${this.widthFrom-70}px`
    },
    multiple: function() {
      let options = this.$store.getters.getOptions({idDash: this.idDash, id: this.id});
      if(options.multiple){
        return options.multiple
      } else {
        return false
      }
    },
    dataRest: function() {
      let data = [];
      if (this.dataReady.length > 0) {
        data = Object.keys(this.dataReady);
        this.show = true;
        if (Object.keys(this.dataReady).length != 0) {
          if (this.dataReady.error) {
            this.message = this.dataReady.error;
            this.show = false;
          } else {
            data = Object.keys(this.dataReady[0]);
          } 
        }
        this.dataFromRest = data;
      }

      return data
    },
    dataRestDeep: function() {
          
      let res = [];
      if (this.dataReady.length > 0) {
        let data = this.dataReady;
        res = Object.values(data).map( item => {
          return item[this.elem];
        })
        res = this.filterSelect(res,this.elemDeep.true);
      }
      return res

    },
    dataelem: function() {
      if (this.$store.getters.getSelected({idDash: this.idDash, id: this.id }).elem == '') {
        this.elem = 'Выберите столбец данных'
      }
      return this.$store.getters.getSelected({idDash: this.idDash, id: this.id }).elem
    },
    dataelemlink: function() {
      if (this.$store.getters.getSelected({idDash: this.idDash, id: this.id }).elemlink == '') {
        this.elemlink = 'Выберите связанный столбец данных'
      }
      return this.$store.getters.getSelected({idDash: this.idDash, id: this.id }).elemlink
    },
    dataelemDeep: function() {
        
      if (this.$store.getters.getSelected({idDash: this.idDash, id: this.id }).elemDeep == '') {
        String(this.multiple) == 'true' ?  this.elemDeep[String(this.multiple)] = [] :  this.elemDeep[String(this.multiple)] = '';
      }
      return this.$store.getters.getSelected({idDash: this.idDash, id: this.id }).elemDeep
    },
    dataLoading: function() {
      return this.dataLoadingFrom
    },
  },  
  methods: {
    getItem: function(element) {
      switch (element){
      case 'elem':
        this.$store.commit('setSelected', {element: 'elem',value: this.elem, idDash: this.idDash, id: this.id });
        break
      case 'elemlink':
        this.$store.commit('setSelected', {element: 'elemlink',value: this.elemlink, idDash: this.idDash, id: this.id });
        break
      }
      if (this.elem != 'Выберите элемент' && this.elemlink != 'Выберите связанный столбец данных') {
        this.openSelect();
      }
      this.chooseText = 'Очистить Все';
      this.selectItems();

    },
    openSelect: function() {
      this.source_show = !this.source_show;
      this.open = !this.open;
      this.select_show = !this.select_show;
    },
    changeColor: function() {
      if (document.querySelectorAll('.v-menu__content').length != 0){
        
        document.querySelectorAll('.v-menu__content').forEach( item => {
          
          item.style.boxShadow = `0 5px 5px -3px ${this.color.border},0 8px 10px 1px ${this.color.border},0 3px 14px 2px ${this.color.border}`;
          item.style.background = this.color.back;
          item.style.color = this.color.text;
          item.style.border = `1px solid ${this.color.border}`;
        })
      }
    },
    selectItems: function() {
      if (this.chooseText == 'Выбрать все') {
        this.chooseText = 'Очистить Все';
        this.chooseIcon = mdiSquare;
        this.elemDeep.true = [...this.topArray,...this.bottomArray];
      } else {
        this.chooseText = 'Выбрать все';
        this.chooseIcon = mdiCropSquare;
        this.elemDeep.true = [];
      }
      this.$store.commit('setSelected', {element: 'elemDeep',value: this.elemDeep.true, idDash: this.idDash, id: this.id });
    },
    filterSelect: function(res,selected) {
      let data = [...[],...res];
      data = data.filter( elem => {
        if (!selected.includes(elem)) {
          return elem
        }
      })

      this.topArray = sorted(selected);        
      this.bottomArray = sorted(data);

      data = [...this.topArray,...this.bottomArray];
      
      function sorted(data) {
        if (Number(data[0])) {
    
          data = data.sort( (a,b) => {
            return a-b
          });
        } else {
          data = data.sort();
        }
        return data
      }

                
            
      return data
    },
    setTocken: function() {
      this.$store.commit('setSelected', {element: 'elemDeep',value: this.elemDeep[String(this.multiple)], idDash: this.idDash, id: this.id });
      let tockens = this.$store.getters.getTockens(this.idDash);
      let name = '';
      let curTocken = {};
      let data = this.dataReady;
      Object.keys(tockens).forEach( i =>{
        if (tockens[i].elem == this.id && tockens[i].action == 'change') {
          curTocken = tockens[i];
          name = tockens[i].name;
        }
      })
      let value = null;
      if (String(this.multiple) == 'true') {
        value = [...[],...this.elemDeep[String(this.multiple)]];
        for (let i = 0; i < data.length; i++) {
          value.forEach((deep,j) => {
            if (data[i][this.elem] == deep) {
              value[j] = data[i][this.elemlink];
            }
          })
        }
      } else {
        for (let i = 0; i < data.length; i++) {
          if (data[i][this.elem] == this.elemDeep[String(this.multiple)]) {
            value = [data[i][this.elemlink]];
            break
          }
        }
      }

      if (curTocken.prefix && curTocken.prefix != '') {
        value = value.map( item => {
          return `${curTocken.prefix}${item}`;
        })
      }
      if (curTocken.sufix && curTocken.sufix != '') {
        value = value.map( item => {
          return `${item}${curTocken.sufix}`;
        })
      }
      if (curTocken.delimetr && curTocken.delimetr != '') {
        value = value.join(curTocken.delimetr);
      } else {
        value = value.join(','); 
      }
            
      let  tocken = {
        name: name,
        action: 'change',
        capture: '',
      }
      if (name != '') {
          
          
        this.$store.commit('setTocken', {tocken: tocken, idDash: this.idDash, value: value, store: this.$store });

      }
    },
  },  
  mounted() {
    this.$store.commit('setActions', {actions: this.actions, idDash: this.idDash, id: this.id });
    let selected =  this.$store.getters.getSelected({idDash: this.idDash, id: this.id })
    if (selected){
      selected.elem ? this.elem = selected.elem : false;
      selected.elemlink ? this.elemlink = selected.elemlink : false;
      if (this.elem != 'Выберите элемент' && this.elemlink != 'Выберите связанный столбец данных') {
        this.openSelect();
      }
      if (selected.elemDeep.length != 0 || selected.elemDeep != '')  {
        this.elemDeep[String(this.multiple)] = selected.elemDeep;
        this.chooseText = 'Очистить Все';
        this.chooseIcon = mdiSquare;
      } else {
        this.chooseText = 'Выбрать все';
        this.chooseIcon = mdiCropSquare;
      }

    }
    // здесь мы ищем иконку стрелки у выпдающего списка, потому что почему-то втсроенный клик на ней не срабатывает, вот мы добавляем свой
    this.$refs.targetBlock.querySelector('.v-input__append-inner').addEventListener('click', () => {
      this.changeColor();
    })

       
  }, 
}

 
</script>

<style lang="sass" > 
  
    @import '../../sass/dashSelect.sass'

   
</style>