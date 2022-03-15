<!-- Модальное окно для создания дашборда -->

<template>
  <v-dialog
    v-model="active"
    width="550"
    @click:outside="cancelModal"
    @keydown.esc="cancelModal"
  >
    <div class="delete-modal-block">
      <v-card :style="{ background: theme.$main_bg }">
        <v-card-text class="headline">
          <div
            class="create-title"
            :style="{ color: theme.$title }"
          >
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
  </v-dialog>
</template>

<script>
export default {
  name: 'ModalDeleteFromMain',
  model: {
    prop: 'modalValue',
    event: 'updateModalValue',
  },
  props: {
    nameFrom: {
      type: String,
      required: true,
    },
    modalValue: {
      type: Boolean,
      default: false,
    },
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
  },
};
</script>

<style lang="scss">
// подключаем стили для этого компонента

@import '../sass/modalDeleteFromMain.sass';
</style>
