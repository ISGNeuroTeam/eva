<template>
  <v-dialog  
    v-model="active" 
    width="90%" 
    persistent 
    @keydown="checkEsc($event)"    
  >
    <v-card  
      class="log-block" 
      :style="{background: theme.$main_bg }"
    >
      <v-card-text 
        class="card-log" 
        :style="{color: theme.$main_text }"
      >
        <div 
          class="log-body" 
          v-html="text" 
        />
      </v-card-text>
      <v-card-actions 
        class="btn-log" 
        :style="{background: theme.$main_bg }"
      >
        <v-btn 
          small 
          :color="theme.$primary_button "
          class="log-btn" 
          @click="clearLog(clear)"
        >
          {{ clear }}
        </v-btn>
        <div 
          class="errorSaveBlock" 
          :style="{color:colorError,opacity:opacityError}"
        > 
          {{ msgError }}
        </div>
        <div class="right-btn">
          <v-btn 
            small 
            :color="theme.$primary_button "
            class="log-btn" 
            @click="sendToBack"
          >
            Сохранить
          </v-btn>
          <v-btn 
            small 
            :color="theme.$primary_button "
            class="log-btn" 
            @click="cancelModal"
          >
            Закрыть
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>


<script>

import {  } from '@mdi/js'

export default {
  props: {
    modalActive: null,
  },
  data () {
    return {
      text: '',
      restore: '',
      clear: 'Очистить',
      msgError: '',
      colorError: '',
      opacityError: 0
    } 
  },
  computed: { 
    active: function() {
      if (this.modalActive) {
        this.getLog();
      }
      return this.modalActive
    },
    theme: function() {
      return this.$store.getters.getTheme
    },
  },  
  methods: {
    cancelModal: function() {
      this.$emit('cancelModal');
      this.clear = 'Очистить';
    },
    getLog: async function() {
      let front = await this.$store.auth.getters.getLog('front'); // получаем все логи для фронта
      let sizeFront = new Blob([front]).size; // смотрим их размер в байтах
      let border = 50000; // предел размера в байтах должен быть приблизителньо 5 мегабайт
      if (sizeFront > border) { // если размер логов больше предела
        this.text = await this.containLog(front,sizeFront,border); // то вызовем функцию которая сократит наши логи до 5 мегабайт
      } else { // если логов меньше 5 мегабайт
        this.text = front; // то просто выведем их
      }
    },
    containLog: async function(text,biLength,border) { // функция которая сократит логи до предела
      let length, procent; // переменные длины строки и 5 % от этой длины
      while (biLength > border) {  // пока размер текста в байтах превышает наш порог
        length = text.length; // запоминаем длину текста
        procent = Math.ceil(length*0.05); // берем 5 % от этой длины
        text = text.slice(0, length-procent); // затем берем текст без этих пяти процентов
        biLength = new Blob([text]).size // и смотрим его размер, чтобы понять стоит ли еще урезать
      }
      // когда уже все урезали, у нас может обрезаться на полуслове последний лог
      text = text.split('<br>'); // чтобы этого избежать мы разобьем строку в массив по переносу строки
      text.pop(); // удалим последний элемент, который может быть обрезан
      text = text.join("<br>"); // и снова склеим
      return text // получили строку не превышающию 5 мегабайт
    },
    sendToBack: async function() {

      let hide = () => {
        this.opacityError = 1;
        setTimeout( () => {
          this.opacityError = 0;
          this.msgError = '';
          this.colorError = '';
        },2000)
      }

      let response =  await this.$store.auth.getters.saveLogIntoBack();
      
      if (response.status == 200) {
        this.msgError = 'Лог сохранен успешно';
        this.colorError = 'teal';
        hide()
      } else {
        this.msgError = 'Не получилось. Попробуйте еще раз.';
        this.colorError = '#FF6D70'; 
        hide()
      }
    
    },
    checkEsc: function(event) {
      if (event.code =="Escape") {
        this.cancelModal();
      }
    },
    clearLog: async function(clear) {
      if (clear == 'Очистить') {
        let response = await  this.$store.auth.getters.deleteLog();
        if (response == 'clear') {
          this.restore = this.text;
          this.text = '';
          this.clear = 'Восстановить';
        }
      } else {
        this.text = this.restore;
        this.clear = 'Очистить';
        this.$store.auth.getters.putLog(this.text);  
      }
    }
  },
}


</script>

<style lang="sass" > 
  
   @import '../../sass/modalLog.sass'

   
</style>