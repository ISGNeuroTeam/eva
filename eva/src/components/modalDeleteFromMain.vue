<!-- Модальное окно для создания дашборда -->

<template>
  <v-dialog
    v-model="active"
    width="550"
    persistent
    @keydown="checkEsc($event)"
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
  props: {
    modalFrom: {
      type: Boolean,
      required: true,
    },
    nameFrom: {
      type: String,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    // тут понимаем нужно ли открыть окно с созданием или нет
    active() {
      return this.modalFrom;
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
      this.$emit('closeModal'); // передаем в родителя чтобы выключили модалку
    },
    checkEsc(event) {
      if (event.code === 'Escape') {
        this.cancelModal();
      }
    },
  },
};
</script>

<style lang="scss">
// подключаем стили для этого компонента

@import '../sass/modalDeleteFromMain.sass';
</style>
