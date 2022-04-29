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
        label="Введите значение"
        hide-details
        class="b-number-line__input"
      />
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
          @click="$emit('change', number)"
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
</style>
