<!-- Модальное окно для подтверждения\отмены какого-либо действия -->

<template>
  <v-dialog
    v-model="confirmModal"
    width="600"
    :content-class="isShadow ? 'modal-confirm--with-shadow' : ''"
    @keydown.esc="closeOnEsc"
    @click:outside="closeOnOutside"
  >
    <v-card
      ref="modalConfirm"
      tabindex="2"
      class="modal-confirm"
      :style="{
        background: theme.$main_bg,
        'box-shadow': `0 3px 1px -2px ${theme.$main_border},0 2px 2px 0 ${theme.$main_border},0 1px 5px 0 ${theme.$main_border}`
      }"
    >
      <v-card-text class="modal-confirm__wrapper">
        <div
          class="modal-confirm__text"
          :style="{ color: theme.$main_text }"
          v-html="modalText"
        />
      </v-card-text>
      <div class="modal-confirm__wrapper modal-confirm__wrapper--bottom">
        <v-btn
          small
          :color="theme.$primary_button"
          :style="{color: theme.$main_text}"
          class="modal-confirm__button"
          @click="confirm(true)"
        >
          {{ btnConfirmText }}
        </v-btn>
        <v-btn
          small
          :color="theme.$primary_button"
          :style="{color: theme.$main_text}"
          class="modal-confirm__button"
          @click="confirm(false)"
        >
          {{ btnCancelText }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'modalConfirm',
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    modalText: {
      type: String,
      default: 'Не сохраненные изменения будут отменены. Продолжить ?',
    },
    btnConfirmText: {
      type: String,
      default: 'Да'
    },
    btnCancelText: {
      type: String,
      default: 'Нет',
    },
    isShadow: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: Object,
      required: true,
    },
    modalValue: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    confirmModal: {
      get() {
        return this.modalValue;
      },
      set(value) {
        this.$emit('updateModalValue', value);
      },
    },
  },
  methods: {
    confirm(result) {
      this.$emit('result', result);
      this.confirmModal = false;
    },
    closeOnEsc(e) {
      this.$emit('closeOnEsc', e);
      this.$refs.modalConfirm.$el.focus();
    },
    closeOnOutside() {
      this.$refs.modalConfirm.$el.focus();
    },
  },
};
</script>

<style lang="sass" scoped>
$main_border: var(--main_border)

.modal-confirm

  &__wrapper
    padding: 20px !important
    display: flex
    justify-content: flex-end
    &--bottom
      padding: 10px !important
  &__text
    font-size: 1.2rem !important
    font-weight: normal
    padding-top: 15px
    text-align: center
    width: 100%
  &__button
    text-transform: lowercase
    margin-right: 10px
    font-size: 1rem
    width: 20%
    &:last-child
      margin-right: 0
  ::v-deep &--with-shadow
    box-shadow: 0 3px 1px -2px $main_border,0 2px 2px 0 $main_border,0 1px 5px 0 $main_border
  ::v-deep &__text > strong
    font-weight: bold
    font-size: 1.5rem !important
</style>
