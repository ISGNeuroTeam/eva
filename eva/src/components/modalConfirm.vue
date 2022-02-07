<template>
  <v-dialog
    v-model="confirmModal"
    width="20%"
    persistent
    @keydown.esc="closeOnEsc"
    @click:outside="closeOnOutside"
  >
    <v-card
      ref="modalConfirm"
      tabindex="2"
      class="modal-confirm"
      :style="{ background: theme.$main_bg }"
    >
      <v-card-text class="modal-confirm__wrapper" :style="{ color: theme.$main_text }">
        <div class="modal-confirm__text">
          {{ modalText }}
        </div>
      </v-card-text>
      <div class="modal-confirm__wrapper modal-confirm__wrapper--bottom">
        <v-btn
          small
          :color="theme.$primary_button"
          class="modal-confirm__button"
          @click="confirm(true)"
        >
          Да
        </v-btn>
        <v-btn
          small
          :color="theme.$primary_button"
          class="modal-confirm__button"
          @click="confirm(false)"
        >
          Нет
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
    closeOnEsc() {
      this.$refs.modalConfirm.$el.focus();
    },
    closeOnOutside() {
      this.$refs.modalConfirm.$el.focus();
    },
  },
};
</script>

<style lang="sass" scoped>
.modal-confirm
  &__wrapper
    padding: 20px !important
    &--bottom
      padding: 10px !important
  &__button, &__text
    color: white
  &__button
    margin-right: 10px
    &:last-child
      margin-right: 0
</style>
