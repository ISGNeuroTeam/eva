<!-- Модальное окно для создания ИС -->

<template>
  <v-dialog  
    :value="active"  
    width="680" 
    persistent  
    @keydown="checkEsc($event)" 
  >
    <v-card 
      class="reports-card" 
      :style="{background: theme.$main_bg}"
    >
      <div class="textarea-block">
        <div class="times-block">
          <div class="time-block">
            <v-text-field  
              v-model="search.parametrs.tws"
              :color="theme.$accent_ui_color" 
              :style="{color: theme.$main_text}"  
              class="textarea-item" 
              outlined 
              label="Временной интервал: начало"  
              hide-details
            />
            <DTPicker 
              v-model="tws"    
              :no-value-to-custom-elem="true"  
              format="YYYY-MM-DD HH:mm"  
              :style="{fill: theme.$main_text, background: theme.$main_bg, color: theme.$main_text}"   
              :color="theme.$accent_ui_color" 
              button-color="theme.$controls" 
              class="dtpicker-report" 
            >
              <v-icon 
                class="picker-report" 
                :color="theme.$primary_button" 
              >
                {{ pickerIcon }}
              </v-icon> 
            </DTPicker>
          </div>
          <div class="time-block">
            <v-text-field  
              v-model="search.parametrs.twf"
              :color="theme.$accent_ui_color" 
              :style="{color: theme.$main_text}" 
              class="textarea-item" 
              outlined 
              label="Временной интервал: конец"
              hide-details
            />
            <DTPicker 
              v-model="twf"   
              :no-value-to-custom-elem="true"
              format="YYYY-MM-DD HH:mm" 
              :style="{fill: theme.$main_text, background: theme.$main_bg, color: theme.$main_text}"  
              :color="theme.$accent_ui_color" 
              button-color="theme.$controls" 
              class="dtpicker-report" 
            >
              <v-icon 
                class="picker-report" 
                :color="theme.$primary_button" 
              >
                {{ pickerIcon }}
              </v-icon> 
            </DTPicker>
          </div>
        </div>
        <v-expansion-panels class="expansion-panels"> 
          <v-expansion-panel :style="{backgroundColor: theme.$main_bg, color: theme.$main_text, border: `1px solid ${theme.$main_border}`}">
            <v-expansion-panel-header>Дополнительные параметры</v-expansion-panel-header>
            <v-expansion-panel-content class="order-expansion">
              <v-text-field  
                v-model="search.parametrs.timeout"
                :color="theme.$accent_ui_color" 
                :style="{color: theme.$main_text}" 
                class="textarea-item" 
                outlined 
                label="Timeout"  
                hide-details
              />
              <v-text-field  
                v-model="search.parametrs.cache_ttl"
                :color="theme.$accent_ui_color" 
                :style="{color: theme.$main_text}" 
                class="textarea-item"  
                outlined 
                label="Cache_ttl"  
                hide-details
              />
              <v-text-field 
                v-model="search.parametrs.field_extraction" 
                :color="theme.$accent_ui_color" 
                :style="{color: theme.$main_text}" 
                class="textarea-item" 
                outlined 
                label="Field_extraction"  
                hide-details
              />
              <v-text-field  
                v-model="search.parametrs.preview" 
                :color="theme.$accent_ui_color" 
                :style="{color: theme.$main_text}" 
                class="textarea-item" 
                outlined 
                label="Preview" 
                hide-details
              />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>  
      </div>
      <v-card-actions class="reports-action">
        <v-spacer />
        <v-btn 
          small 
          :color="theme.$primary_button" 
          class="create-btn" 
          @click="setSearch"
        >
          Подтвердить
        </v-btn>
        <v-btn 
          small 
          :color="theme.$primary_button" 
          class="create-btn" 
          @click="cancelModal"
        >
          Отмена
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script> 

import { mdiCalendarMonth} from '@mdi/js'


export default {
  props: {
    searchFrom: null,
    modalFrom: null,
  },
  data () {
    return {
      search: {
        sid: '',
        original_otl: null,
        parametrs: {
          tws: '',
          twf: '',
          username: 'adminsss',
          timeout: 100,
          preview: 'false',
          field_extraction: 'false',
          cache_ttl: 100,
        }
      },
      tws: '',
      twf: '',
      pickerIcon: mdiCalendarMonth
    }
  },
  computed: {
    active: function() {  // тут понимаем нужно ли открыть окно с созданием или нет
      if (this.modalFrom) {
        this.search = this.searchFrom;
      }
      return this.modalFrom
    },
    theme: function() {
      return this.$store.getters.getTheme
    },
  },
  watch: {
    tws: function (tws) {
      this.search.parametrs.tws = tws ;
    },
    twf: function (twf) {
      this.search.parametrs.twf = twf;
    }
  },
  methods: {  
    cancelModal: function() {
      this.$emit('cancelModal');
    },
    checkEsc: function(event) {
      if (event.code =="Escape") {
        this.cancelModal();
      }
    },
    setSearch: function() {
      if(Number(this.search.parametrs.tws) || this.search.parametrs.tws == 0 ) {  // не придумал ка кполучить не Number()
            
      } else {
        this.search.parametrs.tws = parseInt(new Date(this.search.parametrs.tws).getTime()/1000); 
      }
      if(Number(this.search.parametrs.twf) || this.search.parametrs.twf == 0 ) {  // не придумал ка кполучить не Number()
        
      } else {
        this.search.parametrs.twf = parseInt(new Date(this.search.parametrs.twf).getTime()/1000);
      }
        
      this.$emit('setSearch',this.search);
    },
      
  },
}
</script>

<style lang="sass" > 

     @import '../sass/modalReports.sass'
    
</style>