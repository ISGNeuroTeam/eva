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
        boxShadow: `0 3px 1px -2px ${theme.$main_border},
        0 2px 2px 0 ${theme.$main_border},0 1px 5px 0 ${theme.$main_border}`,
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
    idDashFrom: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      currentId: '',
      isChanged: false,
    };
  },
  computed: {
    getSearches() {
      return this.$store.state[this.idDash]?.searches || [];
    },
    getModalSearch() {
      return this.$store.state[this.idDash]?.modalSearch?.status || false;
    },
    // получаем название элемнета от родителя
    idDash() {
      return this.idDashFrom;
    },
    active: {
      get() {
        if (this.idDash) {
          return this.getModalSearch;
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
    // получаем все ИС на странице
    searches() {
      let searches = [];
      if (this.idDash) {
        searches = this.getSearches;
      }
      return searches;
    },
    theme() {
      return this.$store.getters.getTheme;
    },
    currentSearch() {
      if (this.searches?.length > 0) {
        return this.searches.find((search) => search?.id === this.currentId)?.sid;
      }
      return '';
    },
  },
  watch: {
    active() {
      this.isChanged = false;
      this.currentId = '';
    },
    currentId() {
      this.isChanged = true;
    },
  },
  // при создании окна на странице выключаем все открытые ранее окна
  created() {
    this.$store.commit('setModalSearch', { id: this.idDash, status: false });
  },
  methods: {
    //  если нажали на кнопку согласия
    startDS() {
      // проверяем выбран ли хоть один ИС
      if (this.currentId) {
        // отправляем данные  в хранилище чтобы укзаать элемнету
        // что он должен ссылаться на выбранный ИС
        this.$store.commit('setDataSource', {
          id: this.idDash,
          searchid: this.currentId,
        });
        // закрываем окно
        this.$store.commit('setModalSearch', {
          id: this.idDash,
          status: false,
        });
      }
    },
    // если нажали отмену
    cancelModal() {
      this.$store.commit('setModalSearch', { id: this.idDash, status: false }); // просто закрываем окно
    },
    // функция для выбора одного элемента из списка
    selectSearch(event, search) {
      // получаем родителя в котором находятся все элементы
      const elem = event.target.parentElement;
      // пробегаемся по всем элементам
      elem.parentElement.childNodes.forEach((item) => {
        // и отключаем  обводку
        item.style = 'box-shadow: none';
      });
      // затем получаем текст всего ИС который выбрали
      this.currentId = search.id;
      // и делаем ему обводку
      elem.style = `box-shadow: 0px 0px 4px 3px  ${this.theme.$accent_ui_color}`;
    },
    checkSid(sid) {
      let newSid = sid;
      // если там больше 10 символов
      if (sid.length > 5) {
        // обрезаем и добовляем троеточие
        newSid = `${sid.substring(0, 5)}...`;
      }
      return newSid;
    },
  },
};
</script>

<style lang="scss" scoped>
@import '../sass/modalSearch.sass';
</style>
