<!-- Модальное окно для выбора ИД -->

<template>
  <modal-persistent
    v-model="active"
    width="500"
    :is-confirm="isChanged"
    :persistent="isChanged"
    :theme="theme"
    @cancelModal="cancelModal"
  >
    <v-card
      v-if="active"
      :style="{
        background: theme.$main_bg,
        boxShadow: `0 3px 1px -2px ${theme.$main_border},0 2px 2px 0 ${theme.$main_border},0 1px 5px 0 ${theme.$main_border}`,
        color: theme.$main_text,
      }"
    >
      <div class="searches-block">
        <div
          v-for="sear in searches"
          :key="sear.id"
          class="searches-one"
          @click="selectSearch($event, sear)"
        >
          <div
            class="search-id"
            :style="{
              color: '#FFFFFF',
              background: theme.$accent_ui_color,
              border: `2px solid ${theme.$accent_ui_color}`,
            }"
          >
            {{ checkSid(sear.sid) }}
          </div>
          <div
            class="search-query"
            :style="{
              color: theme.$main_text,
              background: theme.$secondary_bg,
              border: `1px solid ${theme.$main_border}`,
            }"
          >
            {{ sear.original_otl }}
          </div>
        </div>
      </div>
      <v-card-actions>
        <v-spacer />
        <v-btn
          small
          :color="theme.$primary_button"
          class="delete-btn"
          @click="startDS"
        >
          Подтвердить
        </v-btn>
        <v-btn
          small
          :color="theme.$primary_button"
          class="delete-btn"
          @click="cancelModal"
        >
          Отмена
        </v-btn>
      </v-card-actions>
    </v-card>
  </modal-persistent>
</template>

<script>
export default {
  name: 'ModalSearch',
  props: {
    idDashFrom: null,
  },
  data() {
    return {
      currentId: 0,
      isChanged: false,
    };
  },
  computed: {
    idDash() {
      // получаем название элемнета от родителя
      return this.idDashFrom;
    },
    active: {
      get() {
        if (this.idDash) {
          return this.$store.getters.getModalSearch(this.idDash);
        }
        return false;
      },
      set(value) {
        this.$store.commit('setModalSearch', {
          id: this.idDash,
          status: value,
        });
      },
    },
    searches() {
      // получаем все ИС на странице
      return this.idDash
        ? this.$store.getters.getSearches(this.idDash)
        : [];
    },
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    active() {
      this.isChanged = false;
      this.currentId = 0;
    },
    currentId() {
      this.isChanged = true;
    },
  },
  created() {
    this.$store.commit('setModalSearch', { id: this.idDash, status: false }); // при создании окна на странице выключаем все открытые ранее окна
  },
  methods: {
    startDS() {
      //  если нажали на кнопку согласия
      if (this.currentId !== 0) {
        // проверяем выбран ли хоть один ИС
        this.$store.commit('setDataSource', {
          id: this.idDash,
          searchid: this.currentId,
        }); // отправляем данные  в хранилище чтобы укзаать элемнету что он должен ссылаться на выбранный ИС
        this.$store.commit('setModalSearch', {
          id: this.idDash,
          status: false,
        }); // закрываем окно
      }
    },
    cancelModal() {
      // если нажали отмену
      this.$store.commit('setModalSearch', { id: this.idDash, status: false }); // просто закрываем окно
    },
    selectSearch(event, search) {
      // функция для выбора одного элемента из списка
      let elem = event.target.parentElement; // получаем родителя в котором находятся все элементы
      elem.parentElement.childNodes.forEach((item) => {
        // пробегаемся по всем элементам
        item.style = 'box-shadow: none'; // и отключаем  обводку
      });
      this.currentId = search.sid; // затем получаем текст всего ИС который выбрали
      elem.style = `box-shadow: 0px 0px 4px 3px  ${this.theme.$accent_ui_color}`; // и делаем ему обводку
    },
    checkSid(sid) {
      let newSid = sid;
      if (sid.length > 5) {
        // если там больше 10 символов
        newSid = sid.substring(0, 5) + '...'; // обрезаем и добовляем троеточие
      }
      return newSid;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../sass/modalSearch.sass';
</style>
