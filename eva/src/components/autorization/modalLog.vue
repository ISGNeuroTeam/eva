<template>
  <v-dialog
    v-model="active"
    width="90%"
    persistent
    @keydown="checkEsc($event)"
  >
    <v-card
      class="log-block"
      :style="{ background: theme.$main_bg }"
    >
      <v-card-text
        class="card-log"
        :style="{ color: theme.$main_text }"
      >
        <div
          class="log-body"
          v-html="text"
        />
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
  </v-dialog>
</template>

<script>
export default {
  props: {
    modalActive: {
      type: Boolean,
      required: true,
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
    };
  },
  computed: {
    active() {
      if (this.modalActive) {
        this.getLog();
      }
      return this.modalActive;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  methods: {
    cancelModal() {
      this.$emit('cancelModal');
      this.clear = 'Очистить';
    },
    async getLog() {
      // получаем все логи для фронта
      const front = await this.$store.getters['auth/getLog']('front');
      // смотрим их размер в байтах
      const sizeFront = new Blob([front]).size;
      // предел размера в байтах должен быть приблизителньо 5 мегабайт
      const border = 50000;
      // если размер логов больше предела
      if (sizeFront > border) {
        // то вызовем функцию которая сократит наши логи до 5 мегабайт
        this.text = await this.containLog(front, sizeFront, border);
      } else {
        // если логов меньше 5 мегабайт
        // то просто выведем их
        this.text = front;
      }
    },
    containLog(text, biLength, border) {
      let localText = text;
      let localBitLength = biLength;
      // функция которая сократит логи до предела
      let length;
      // переменные длины строки и 5 % от этой длины
      let procent;
      // пока размер текста в байтах превышает наш порог
      while (localBitLength > border) {
        // запоминаем длину текста
        length = localText.length;
        // берем 5 % от этой длины
        procent = Math.ceil(length * 0.05);
        // затем берем текст без этих пяти процентов
        localText = localText.slice(0, length - procent);
        // и смотрим его размер, чтобы понять стоит ли еще урезать
        localBitLength = new Blob([localText]).size;
      }
      // когда уже все урезали, у нас может обрезаться на полуслове последний лог
      localText = localText.split('<br>'); // чтобы этого избежать мы разобьем строку в массив по переносу строки
      localText.pop(); // удалим последний элемент, который может быть обрезан
      localText = localText.join('<br>'); // и снова склеим
      return localText; // получили строку не превышающию 5 мегабайт
    },
    async sendToBack() {
      const hide = () => {
        this.opacityError = 1;
        setTimeout(() => {
          this.opacityError = 0;
          this.msgError = '';
          this.colorError = '';
        }, 2000);
      };

      const response = await this.$store.getters['auth/saveLogIntoBack']();

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
    checkEsc(event) {
      if (event.code === 'Escape') {
        this.cancelModal();
      }
    },
    async clearLog(clear) {
      if (clear === 'Очистить') {
        const response = await this.$store.getters['auth/deleteLog']();
        if (response === 'clear') {
          this.restore = this.text;
          this.text = '';
          this.clear = 'Восстановить';
        }
      } else {
        this.text = this.restore;
        this.clear = 'Очистить';
        this.$store.getters['auth/putLog'](this.text);
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/modalLog.sass';
</style>
