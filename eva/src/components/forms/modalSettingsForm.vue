<template >
    <v-dialog  v-model="modal"  width="1140" style="height:80vh;" persistent  > 
       <!--  <div class="create-modal-block" :class={create_warning:create_warning} > -->
        <div class="settings-modal-form-block"  >
        <v-card >
            <v-card-text class="headline "><div class="settings-title">Настройки</div></v-card-text>
                <div class="options-block" >

                    <div class="option-item">
                        <div class="name-option main item" >Название</div>
                        <div class="discribe-option main item" >Описание</div>
                        <div class="status-option main item" >Статус</div>
                    </div>
                    <!-- Настройки Выпадающего списка -->
                     <div class="option-item" v-if="visibleOptions.select">
                        <div class="name-option item">Выбор элементов</div>
                        <div class="discribe-option item">Элементы для выбора из выпадающего списка</div>
                        <div class="status-option item">
                            <v-textarea  class="select-form-area" color="#333" outlined placeholder="select1; select2" row-height="20px"  rows="3" v-model="selectOptions.select" hide-details></v-textarea>
                        </div>
                    </div>
                    <!--    ----   -->
                    <!-- Настройки Радио -->
                     <div class="option-item" v-if="visibleOptions.radio">
                        <div class="name-option item">Имя группы переключателей</div>
                        <div class="discribe-option item">Переключатель с одинаковым имемнем работают исключая друг друга</div>
                        <div class="status-option item">
                             <v-text-field  class="radio-name" color="#333"   outlined v-model="radioOptions.nameRadio" hide-details ></v-text-field>
                        </div>
                    </div>
                     <!--    ----   -->
                     <!-- Общие настройки   -->
                        <div class="option-item">
                            <div class="name-option item">Идентификатор</div>
                            <div class="discribe-option item">Это ли поле является идентификатором?</div>
                            <div class="status-option item">
                                 <v-switch @change="$event => {general.ident = $event}" v-model="general.ident" color="teal"  ></v-switch> 
                                <!-- <v-text-field  class="radio-name" color="#333"   outlined v-model="general.ident" hide-details ></v-text-field> -->
                            </div>
                        </div>
                     <!--    ----   -->

                </div>
            <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn small color="teal" class="create-btn" @click="acceptBtn">Подтвердить</v-btn>
            <v-btn small color="#FF6D70" class="create-btn" @click="cancelModal">Отмена</v-btn>
            </v-card-actions>
        </v-card>
        <!-- <div class="warning-block" :style="{background:color.backElement}">
                    <div class="warning-text"  :style="{color:color.text}">Такой DashBoard существует. Хотите заменить его?</div>
                    <div class="btn-warning"> 
                        <v-btn small :color="color.controls" class="warning-btn" @click="yesDashBoards">Да</v-btn>
                        <v-btn small :color="color.controlsActive" class="warning-btn" @click="noDashBoards">Нет</v-btn>
                    </div>
        </div> -->
        </div>
    </v-dialog>
</template>


<script>

import {    } from '@mdi/js'

export default {
    props: {
        modalFrom: null,
        settingsFrom: null,
    },
    data () {
        return {
            selectOptions: {
                select: '',
            },
            radioOptions: {
                nameRadio: '',
            },
            general: {
                ident: false,
            },
            visibleOptions: {
                select: false,
                radio: false,
            },
            currentElem: '',
            val: ''

        } 
    },
     computed: {  // осоновные параметры, которые чатсо меняются и которы следует отслеживать
        modal: function() { 
            if (this.modalFrom) {
                this.prepareModal();
            }
             return this.modalFrom
             },
        settings: function() {
            return this.settingsFrom
        },
        
     },  
     methods: {
        acceptBtn: function() {
            let options = {};
            
            switch(this.currentElem){
                case 'select':
                    options = this.selectOptions
                break
                case 'radio':
                    options = this.radioOptions
                break
            }
            Object.keys(this.general).forEach( item => {
                options[item] = this.general[item];
            })
            if (Object.keys(options).length != 0) {
                this.$store.form.commit('setOptionsForm',{element:this.settings.key, options:options})
            }
            this.cancelModal();
        },
       cancelModal: function() {
           this.$emit('hideForm');
       },
       prepareModal: function() {
            Object.keys(this.visibleOptions).forEach( item => {
                this.visibleOptions[item] = false;
            })
            let options = this.$store.form.getters.getOption(this.settings);
            switch(this.settings.name) {
                case 'Выпадающий список':
                    this.currentElem = 'select';
                    this.visibleOptions.select = true;
                    this.addOptions(options,this.selectOptions);
                break
                 case 'Выбор одного варианта':
                    this.currentElem = 'radio';
                    this.visibleOptions.radio = true;

                    this.addOptions(options,this.radioOptions);
                break
            }
            options.ident == true ? this.general.ident = true : this.general.ident = false; 
            
            
        },
        addOptions: function(options,curOptions) {
            if (options != 'empty') {
                Object.keys(options).forEach( item => {
                    curOptions[item] = options[item];
                })
            }
        }
     },
     mounted() {
     }

}


</script>

<style lang="scss" > 

    @import '../../sass/modalSettingsForm.sass'

</style>