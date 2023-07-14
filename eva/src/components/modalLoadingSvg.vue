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
        Загрузка файла
      </div>
      <div class="b-loading-svg__radio">
        <v-radio-group
          v-model="uploadType"
          :color="theme.$primary_button"
          @change="file = null"
        >
          <v-radio
            v-for="option in uploadTypes"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </v-radio-group>
      </div>
      <div class="b-loading-svg__input">
        <v-file-input
          v-model="file"
          :color="theme.$main_text"
          :style="{ color: theme.$main_text }"
          :rules="[
            value => !value || (!fileType || value.type === fileType) || 'Недопустимый формат!',
          ]"
          :accept="fileType"
          :label="fileLabel"
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
          :disabled="!file || (fileType && file.type !== fileType) || disabled || fileLoading"
          :loading="fileLoading"
          @click="loadFile"
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
      :modal-text="`Есть неотправленные данные, отправить?`"
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
    uploadTypes: {
      type: Array,
      default: () => ([
        { label: 'SVG', value: 'svg', type: 'image/svg+xml' },
        { label: 'Файл', value: 'file', type: null },
      ]),
    },
  },
  data() {
    return {
      uploadType: 'svg',
      file: null,
      message: '',
      color: '',
      modalValue: false,
      disabled: false,
      fileLoading: false,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    fileLabel() {
      const { uploadTypes, uploadType } = this;
      return `Выберите ${uploadTypes.find(({ value }) => value === uploadType).label.toLowerCase()}`;
    },
    fileType() {
      const { uploadTypes, uploadType } = this;
      return uploadTypes.find(({ value }) => value === uploadType).type;
    },
  },
  methods: {
    cancelModal() {
      const { file, fileType } = this;
      if (this.file && (!fileType || file.type === fileType)) {
        this.modalValue = true;
      } else {
        this.$emit('updateModalValue', false);
      }
    },
    async loadFile() {
      this.disabled = true;
      this.fileLoading = true;
      const formData = new FormData();
      formData.append('file', this.file);
      const res = await this.$store.dispatch('setLoadingSvg', {
        file: this.file,
        formData,
        path: this.uploadType,
      });
      this.fileLoading = false;
      this.color = '';
      this.message = '';
      if (res.status === 'ok' && res?.notifications) {
        this.file = null;
        this.$store.commit('notify/addNotifications', res.notifications);
        setTimeout(() => {
          this.$emit('updateModalValue', false);
        }, 1000);
      } else {
        this.color = 'red';
        this.message = res.statusText ? `Ошибка: ${res.statusText}` : 'Загрузить файл не удалось.';
      }
      this.disabled = false;
    },
    focus() {
      this.color = '';
      this.message = '';
    },
    confirm(val) {
      if (val) {
        this.loadFile();
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
  &__radio::v-deep {
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
