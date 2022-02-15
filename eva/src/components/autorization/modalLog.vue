<template>
  <modal-persistent
    ref="persistentModal"
    v-model="active"
    :theme="theme"
    :is-confirm="isChanged"
    :persistent="isChanged"
    width="90%"
    @cancelModal="cancelModal"
  >
    <v-card class="log-block" :style="{ background: theme.$main_bg }">
      <v-card-text class="card-log" :style="{ color: theme.$main_text }">
        <div class="log-body" v-html="text" />
      </v-card-text>
      <v-card-actions
        class="btn-log"
        :style="{ background: theme.$main_bg }"
      >
        <v-btn
          small
          :color="theme.$primary_button"
          class="log-btn"
          @click="clearLog(clear)"
        >
          {{ clear }}
        </v-btn>
        <div
          class="errorSaveBlock"
          :style="{ color: colorError, opacity: opacityError }"
        >
          {{ msgError }}
        </div>
        <div class="right-btn">
          <v-btn
            small
            :color="theme.$primary_button"
            class="log-btn"
            @click="sendToBack"
          >
            Сохранить
          </v-btn>
          <v-btn
            small
            :color="theme.$primary_button"
            class="log-btn"
            @click="cancelModal"
          >
            Закрыть
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </modal-persistent>
</template>

<script>
export default {
  name: 'ModalLog',
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    modalValue: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      text: '',
      restore: '',
      clear: 'Очистить',
      msgError: '',
      colorError: '',
      opacityError: 0,
      isChanged: false,
    };
  },
  computed: {
    active: {
      get() {
        return this.modalValue;
      },
      set(value) {
        this.$emit('updateModalValue', value);
      },
    },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    active() {
      if (this.modalValue) {
        this.getLog();
      }
    },
  },
  methods: {
    cancelModal() {
      this.clearLog('Восстановить');
      this.active = false;
    },
    async getLog() {
      let front = await this.$store.auth.getters.getLog('front'); // получаем все логи для фронта
      let sizeFront = new Blob([front]).size; // смотрим их размер в байтах
      let border = 50000; // предел размера в байтах должен быть приблизителньо 5 мегабайт
      if (sizeFront > border) {
        // если размер логов больше предела
        this.text = await this.containLog(front, sizeFront, border); // то вызовем функцию которая сократит наши логи до 5 мегабайт
      } else {
        // если логов меньше 5 мегабайт
        this.text = front; // то просто выведем их
      }
    },
    async containLog(text, biLength, border) {
      // функция которая сократит логи до предела
      let length, procent; // переменные длины строки и 5 % от этой длины
      while (biLength > border) {
        // пока размер текста в байтах превышает наш порог
        length = text.length; // запоминаем длину текста
        procent = Math.ceil(length * 0.05); // берем 5 % от этой длины
        text = text.slice(0, length - procent); // затем берем текст без этих пяти процентов
        biLength = new Blob([text]).size; // и смотрим его размер, чтобы понять стоит ли еще урезать
      }
      // когда уже все урезали, у нас может обрезаться на полуслове последний лог
      text = text.split('<br>'); // чтобы этого избежать мы разобьем строку в массив по переносу строки
      text.pop(); // удалим последний элемент, который может быть обрезан
      text = text.join('<br>'); // и снова склеим
      return text; // получили строку не превышающию 5 мегабайт
    },
    async sendToBack() {
      this.isChanged = false;
      this.$refs.persistentModal.focusOnModal();
      let hide = () => {
        this.opacityError = 1;
        setTimeout(() => {
          this.opacityError = 0;
          this.msgError = '';
          this.colorError = '';
        }, 2000);
      };

      let response = await this.$store.auth.getters.saveLogIntoBack();

      if (response.status === 200) {
        this.msgError = 'Лог сохранен успешно';
        this.colorError = 'teal';
        hide();
      } else {
        this.msgError = 'Не получилось. Попробуйте еще раз.';
        this.colorError = '#FF6D70';
        hide();
      }
    },
    async clearLog(clear) {
      if (clear === 'Очистить') {
        this.isChanged = true;
        this.$refs.persistentModal.focusOnModal();
        let response = await this.$store.auth.getters.deleteLog();
        if (response === 'clear') {
          this.restore = this.text;
          this.text = '';
          this.clear = 'Восстановить';
        }
      } else {
        this.isChanged = false;
        this.text = this.restore;
        this.clear = 'Очистить';
        this.$store.auth.getters.putLog(this.text);
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/modalLog.sass';
</style>
