<template>
  <v-dialog
    :value="modalValue"
    v-bind="$attrs"
    persistent
    @keydown="checkKeyDown"
    @click:outside="closeOnOutside"
    @input="$emit('updateModalValue', $event)"
  >
    <div ref="modalWithConfirm" tabindex="99999" class="modal-with-confirm">
      <slot name="activator" />
      <slot />
      <modal-confirm v-model="confirmModal" :theme="theme" @result="result" />
    </div>
  </v-dialog>
</template>

<script>
export default {
  name: 'modalWithConfirm',
  inheritAttrs: false,
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    modalValue: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      confirmModal: false,
    };
  },
  methods: {
    openConfirmModal() {
      this.confirmModal = true;
    },
    checkKeyDown(event) {
      if (event?.code === 'Escape') {
        this.openConfirmModal();
      } else {
        this.$emit('keydown', event);
      }
    },
    closeOnOutside() {
      this.$refs.modalWithConfirm.focus();
      this.openConfirmModal();
    },
    result(value) {
      if (value) {
        this.cancelModal();
      }
    },
    cancelModal() {
      this.$emit('updateModalValue', false);
      this.$emit('cancelModal');
    },
  },
};
</script>

<style lang="sass" scoped>
.modal-with-confirm
  width: 100%
  height: 100%
  max-width: 100%
  max-height: 100%
</style>
