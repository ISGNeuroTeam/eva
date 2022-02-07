<!-- Модальное окно для создания дашборда -->

<template>
  <modal-persistent
    v-model="active"
    width="550"
    :theme="theme"
    :is-confirm="false"
    @cancelModal="cancelModal"
  >
    <div class="delete-modal-block">
      <v-card :style="{ background: theme.$main_bg }">
        <v-card-text class="headline">
          <div class="create-title" :style="{ color: theme.$title }">
            Вы точно хотите удалить
            <p>
              {{ nameFrom }}
            </p>
            ?
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            small
            :color="theme.$primary_button"
            class="create-btn"
            @click="deleteBtn"
          >
            Удалить
          </v-btn>
          <v-btn
            small
            :color="theme.$primary_button"
            class="create-btn"
            @click="cancelModal"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </modal-persistent>
</template>

<script>
export default {
  name: 'ModalDeleteFromMain',
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    modalValue: {
      type: Boolean,
      default: false,
    },
    nameFrom: null,
  },
  data() {
    return {};
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    active: {
      get() {
        return this.modalValue;
      },
      set(value) {
        this.$emit('updateModalValue', value);
      },
    },
    name() {
      return this.nameFrom;
    },
  },
  methods: {
    deleteBtn() {
      this.$emit('deleteElem');
    },
    cancelModal() {
      // есл инажали на отмену создания
      this.active = false; // передаем в родителя чтобы выключили модалку
    },
    // changeStyle: function() {
    //   if (this.active) {
    //     let dialog = document.querySelector('.v-dialog');
    //     dialog.style.boxShadow = `0 3px 1px -2px ${this.color.border},0 2px 2px 0 ${this.color.border},0 1px 5px 0 ${this.color.border}`;
    //     dialog.querySelectorAll('.v-input__slot').forEach( item => {
    //       item.style.boxShadow = `0 3px 1px -2px ${this.color.border},0 2px 2px 0 ${this.color.border},0 1px 5px 0 ${this.color.border}`;
    //     })
    //     dialog.querySelectorAll('input').forEach( item => {
    //       item.style.color = this.color.text;
    //     })
    //   }
    // },
  },
};
</script>

<style lang="scss">
// подключаем стили для этого компонента

@import '../sass/modalDeleteFromMain.sass';
</style>
