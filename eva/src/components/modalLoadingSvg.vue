<template>
  <v-dialog
    :value="loadSvg"
    class="b-loading-svg"
    width="600"
    @click:outside="cancelModal"
    @input="$emit('updateModalValue', $event)"
  >
    <div class="b-loading-svg__content">
      <div class="b-loading-svg__title">
        Загрузка SVG
      </div>
      <div class="b-loading-svg__input">
        <v-file-input
          v-model="file"
          :color="theme.$main_text"
          :style="{ color: theme.$main_text }"
          :rules="[
            value => !value || value.size < 10000000 || 'Размер должен быть меньше 2 МБ!',
            value => !value || value.type === 'image/svg+xml' || 'Не допустимый формат!',
          ]"
          accept="image/svg+xml"
          label="Выбирите Svg"
          @focus="focus()"
        />
      </div>
      <div
        v-if="message"
        :style="`color: ${color}`"
        class="b-loading-svg__message"
      >
        {{ message }}
      </div>
      <div class="b-loading-svg__row">
        <v-btn
          small
          :color="theme.$primary_button"
          class="b-loading-svg__button"
          :disabled="!file || file.type !== 'image/svg+xml'"
          @click="loadingSvg"
        >
          Отправить
        </v-btn>
        <v-btn
          small
          :color="theme.$primary_button"
          class="b-loading-svg__button"
          @click="cancelModal"
        >
          Закрыть
        </v-btn>
      </div>
    </div>
    <modal-confirm
      v-model="modalValue"
      :theme="theme"
      :modal-text="`Есть несохраненные данные, сохранить?`"
      btn-confirm-text="Да"
      btn-cancel-text="Нет"
      @result="confirm($event)"
    />
  </v-dialog>
</template>

<script>
export default {
  name: 'ModalLoadingSvg',
  model: {
    prop: 'loadSvg',
    event: 'updateLoadingSvg',
  },
  props: {
    loadSvg: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      file: null,
      message: '',
      color: '',
      modalValue: false,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  methods: {
    cancelModal() {
      if (this.file) {
        this.modalValue = true;
      } else {
        this.$emit('updateModalValue', false);
      }
    },
    async loadingSvg() {
      const formData = new FormData();
      formData.append('file', this.file);
      const response = await this.$store.dispatch('setLoadingSvg', {
        file: this.file,
        formData,
      });
      const res = JSON.parse(response);
      if (res.status === 'ok') {
        this.message = `Загрузка файла ${this.file.name} прошла успешно`;
        this.color = 'green';
        setTimeout(() => {
          this.file = null;
          this.$emit('updateModalValue', false);
          this.color = '';
          this.message = '';
        }, 1000);
      } else {
        this.color = 'red';
        this.message = `Загрузить файл ${this.file.name} не удалось.`;
      }
    },
    focus() {
      this.color = '';
      this.message = '';
    },
    confirm(val) {
      if (val) {
        this.loadingSvg();
      } else {
        this.file = null;
        this.$emit('updateModalValue', false);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.b-loading-svg {
  &__content {
    background: var(--main_bg);
    padding: 20px 30px;
  }
  &__title {
    color: var(--main_text);
    font-size: 24px;
    text-align: center;
  }
  &__input::v-deep {
    .v-icon,
    .v-file-input__text {
      color: var(--main_text) !important;
    }
  }
  &__message {
    margin-bottom: 20px;
  }
  &__row {
    display: flex;
    justify-content: flex-end;
  }
  &__button {
    margin-right: 10px;
    color: #fff;
  }
}
</style>
