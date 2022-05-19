<template>
  <v-dialog
    :value="numberLineModal"
    max-width="600"
    @input="$emit('updateNumberLineModal', $event)"
  >
    <div class="b-number-line">
      <div class="d-flex justify-space-between">
        <div class="b-number-line__title">
          Количество отображаемых строк
        </div>
        <v-icon
          class="b-number-line__icon"
          :color="theme.$main_text"
          @click="close"
        >
          {{ mdiPlus }}
        </v-icon>
      </div>
      <div class="b-number-line__subtitle">
        Выберите количество отображаемых строк в окне запроса до появления внутреннего скролла
      </div>
      <v-text-field
        v-model="number"
        :color="theme.$primary_button"
        :style="{ color: theme.$main_text }"
        outlined
        :error-messages="error"
        label="Введите значение"
        type="number"
        hide-details
        class="b-number-line__input"
        @input="changeInput"
      />
      <div
        class="b-number-line__error"
        :style="{ color: theme.$error_color }"
        :class="{ errormsgshow: msg }"
      >
        {{ error }}
      </div>
      <div class="b-number-line__row">
        <v-btn
          text
          class="b-number-line__btn"
          @click="close"
        >
          Отменить
        </v-btn>
        <v-btn
          :color="theme.$primary_button"
          class="b-number-line__btn b-number-line__btn--save"
          @click="save"
        >
          Сохранить
        </v-btn>
      </div>
    </div>
  </v-dialog>
</template>

<script>
import { mdiPlus } from '@mdi/js';

export default {
  name: 'NumberLineModal',
  model: {
    prop: 'numberLineModal',
    event: 'updateNumberLineModal',
  },
  props: {
    numberLineModal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      number: '',
      error: '',
      msg: false,
      mdiPlus,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  methods: {
    close() {
      this.number = '';
      this.$emit('close');
    },
    save() {
      if (this.number > 100) {
        this.number = 100;
      }
      if (this.number <= 0) {
        this.number = 10;
      }
      this.$emit('change', this.number);
      this.close();
    },
    changeInput() {
      if (this.number > 100 || this.number <= 0) {
        this.error = 'Число должно быть больше 0 и не должно быть больше 100';
        this.msg = true;
      } else {
        this.error = '';
        this.msg = false;
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.b-number-line
  padding: 32px
  background: var(--main_bg)
  &__title
    font-size: 24px
    font-weight: 600
    color: var(--main_text)
    margin-bottom: 4px
  &__icon
    transform: rotate(45deg)
    cursor: pointer
  &__subtitle
    font-size: 17px
    color: var(--secondary_text)
    margin-bottom: 16px
  &__input
    margin-bottom: 16px
    &::v-deep
      .v-input__slot
        min-height: 30px
        .v-label
          color: var(--main_text)
          font-size: 11px
          top: 8px
        .v-label--active
          top: 18px
  &__row
    display: flex
    justify-content: flex-end
  &__btn
    font-size: 13px
    margin-left: 20px
    color: var(--main_text)
    &--save
      color: #fff
  &__error
    font-size: 14px
    opacity: 0
    transition: all .3s ease-in-out
    &.errormsgshow
      opacity: 1
</style>
