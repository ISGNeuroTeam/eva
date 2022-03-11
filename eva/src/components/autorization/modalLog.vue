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
      // получаем все логи для фронта
      const front = await this.$store.dispatch('auth/getLog', 'front');
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
    async containLog(text, biLength, border) {
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
      this.isChanged = false;
      this.$refs.persistentModal.focusOnModal();
      const hide = () => {
        this.opacityError = 1;
        setTimeout(() => {
          this.opacityError = 0;
          this.msgError = '';
          this.colorError = '';
        }, 2000);
      };

      const response = await this.$store.dispatch('auth/saveLogIntoBack');

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
        const response = await this.$store.dispatch('auth/deleteLog');
        this.isChanged = true;
        this.$refs.persistentModal.focusOnModal();
        if (response === 'clear') {
          this.restore = this.text;
          this.text = '';
          this.clear = 'Восстановить';
        }
      } else {
        this.isChanged = false;
        this.text = this.restore;
        this.clear = 'Очистить';
        await this.$store.dispatch('auth/putLog', this.text);
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/modalLog.sass';
</style>
