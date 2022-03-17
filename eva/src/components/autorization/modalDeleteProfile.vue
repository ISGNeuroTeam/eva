<template>
  <v-dialog
    v-model="active"
    width="400px"
    persistent
    @keydown="checkEsc($event)"
  >
    <v-card
      class="delete-profile"
      :style="{ background: theme.$main_bg }"
    >
      <v-card-text>
        <div
          class="name-profile"
          :style="{ color: theme.$title }"
          v-html="dataFrom.text"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn
          small
          :color="theme.$primary_button"
          class="profile-btn"
          @click="deleteEssence"
        >
          Удалить
        </v-btn>
        <v-btn
          small
          :color="theme.$primary_button"
          class="profile-btn"
          @click="cancelModal"
        >
          Отмена
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    activeDelete: {
      type: Boolean,
      required: true,
    },
    dataFrom: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {};
  },
  computed: {
    active() {
      return this.activeDelete;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  methods: {
    cancelModal() {
      this.$emit('cancelModal');
    },
    checkEsc(event) {
      if (event.code === 'Escape') {
        this.cancelModal();
      }
    },
    deleteEssence() {
      const response = this.$store.getters['auth/deleteEssence']({
        id: this.dataFrom.id,
        essence: this.dataFrom.essence,
      });

      response.then((res) => {
        if (res.status === 200) {
          this.cancelModal();
        }
      });
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/modalDeleteProfile.sass';
</style>
