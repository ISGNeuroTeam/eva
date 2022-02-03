<template>
  <v-app>
    <v-content>
      <div class="form-panel-board">
        <div class="title-name">Список форм</div>
      </div>

      <!-- Страница  пользователя -->
      <v-container class="main-form-container">
        <v-skeleton-loader
          v-if="loading"
          type="image"
          height="300"
          width="100%"
        ></v-skeleton-loader>
        <div class="main-form-lines">
          <v-card
            v-for="item in forms"
            :key="item[0]"
            tile
            class="form-line"
            @click="openForm(item, $event)"
          >
            <v-list-item-group>
              <v-list-item>
                <div class="loading-bar"></div>
                <v-list-item-content class="list-content">
                  <v-list-item-title class="list-title">{{
                    item[1].toUpperCase()
                  }}</v-list-item-title>
                  <v-list-item-subtitle class="list-subtitle">{{
                    nameForm
                  }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-card>
        </div>
        <div class="divider"></div>
        <div class="main-form">
          <v-card class="form-block" @click="createFormTemplate($event)">
            <div class="loading-bar"></div>
            <v-card-text class="card-text">
              <p>Заполнить новую форму</p>
              <v-icon class="plus">{{ plus }}</v-icon>
            </v-card-text>
          </v-card>
        </div>
      </v-container>
      <!--  ---  -->
    </v-content>
  </v-app>
</template>

<script>
import { mdiPlusCircleOutline } from '@mdi/js';

export default {
  data() {
    return {
      plus: mdiPlusCircleOutline,
      templateName: 'adad',
      forms: [],
      loading: true,
    };
  },
  computed: {
    idForm: function () {
      // id шаблона
      return this.$route.params.id;
    },
    nameForm: function () {
      // имя шаблона
      return this.$route.query.name;
    },
  },
  mounted() {
    this.getForms(this.idForm); // при обновлениии страницы получаем список всех форм по новой
  },
  methods: {
    getForms: async function (id) {
      // получаем список всех форм данного шаблона
      let forms = await this.$store.form.getters.getAllForm(id); // собственно сам список
      this.forms = forms; // заносим список в переменную
      this.loading = false; // отключаем загрузку
    },
    getTemplate: async function (idForm) {
      // получаем структуру шаблона
      let form = await this.$store.form.getters.getTemplate(idForm);
      return form;
    },
    getAllContent: async function (ids) {
      // получаем контент конкретной формы
      let form = await this.$store.form.getters.getFormContent(ids);
      return form;
    },
    openForm: async function (name, event) {
      // открываем уже существующию форму
      let element = event.target.parentElement; // получаем родителя элемента на который щелкнули
      while (!element.classList.contains('v-list-item')) {
        // и пока не "всплывем" до нужного нам родителя
        element = element.parentElement; // обновляем переменную в которой будет нужный нам элемент
      }
      element = element.querySelector('.loading-bar'); // ищем внутри нашего родителя нужный блок
      element.classList.add('loading'); // и добовляем ему видимость загрузки
      let form = await this.getTemplate(this.idForm); // получаем шаблон из базы данных
      this.$store.form.commit('setTemplate', form.cells); // и заносим его в локальное хранилище
      let content = await this.getAllContent({
        idTemplate: this.idForm,
        idForm: name[0],
      }); // получаем контент из базы данных
      content.splice(content.length - 2, 2); // отсекаем два послдених значения ибо это передается мета информация вроде id формы
      let contentObj = {}; // но нам нужно сохранить в локальное хранилище объект, а не массив
      content.forEach((item, i) => {
        // пробегаемся по всему массиву
        if (Number(item)) {
          contentObj[i] = Number(item);
        } else {
          contentObj[i] = item;
        }
      });
      this.$store.form.commit('setAllContent', contentObj); // заносим контент в локальное хранилище
      element.classList.remove('loading'); // удаляем класс с загрузкой
      this.$router.push(
        `/forms/edit?editable=false&id=${this.idForm}&nameForm=${name[1]}`
      ); // переходим на страницу редактирования формы
    },
    createFormTemplate: async function (event) {
      // мтеод создающий новую форму
      let formBlock = event.target;
      while (!formBlock.classList.contains('form-block')) {
        formBlock = formBlock.parentElement;
      }
      let loading = formBlock.querySelector('.loading-bar');
      loading.classList.add('loading');
      let form = await this.getTemplate(this.idForm); // получаем структуру формы

      this.$store.form.commit('setTemplate', form.cells); // и заносим его в локальное хранилище
      this.$store.form.commit('setAllContent', 'empty'); // в контент заносим пустое значение
      this.$store.form.commit('setDisabled', false); // включаем кнопку сохранить
      loading.classList.remove('loading');
      this.$router.push(
        `/forms/edit?editable=true&id=${this.idForm}&nameForm=Новая форма`
      ); // и переходим на страницу редактирования
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/formOpenList.sass';
</style>
