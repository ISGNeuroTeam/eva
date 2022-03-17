<template>
  <v-app>
    <v-content>
      <div class="form-panel-board">
        <div class="title-name">
          Список форм
        </div>
      </div>

      <!-- Страница  пользователя -->
      <v-container class="main-form-container">
        <v-skeleton-loader
          v-if="loading"
          type="image"
          height="300"
          width="100%"
        />
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
                <div class="loading-bar" />
                <v-list-item-content class="list-content">
                  <v-list-item-title class="list-title">
                    {{
                      item[1].toUpperCase()
                    }}
                  </v-list-item-title>
                  <v-list-item-subtitle class="list-subtitle">
                    {{
                      nameForm
                    }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-card>
        </div>
        <div class="divider" />
        <div class="main-form">
          <v-card
            class="form-block"
            @click="createFormTemplate($event)"
          >
            <div class="loading-bar" />
            <v-card-text class="card-text">
              <p>Заполнить новую форму</p>
              <v-icon class="plus">
                {{ plus }}
              </v-icon>
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
    // id шаблона
    idForm() {
      return this.$route.params.id;
    },
    // имя шаблона
    nameForm() {
      return this.$route.query.name;
    },
  },
  mounted() {
    // при обновлениии страницы получаем список всех форм по новой
    this.getForms(this.idForm);
  },
  methods: {
    // получаем список всех форм данного шаблона
    async getForms(id) {
      const forms = await this.$store.dispatch('form/getAllForm', id); // собственно сам список
      // заносим список в переменную
      this.forms = forms;
      // отключаем загрузку
      this.loading = false;
    },
    // получаем структуру шаблона
    async getTemplate(idForm) {
      const form = await this.$store.dispatch('form/getTemplate', idForm);
      return form;
    },
    // получаем контент конкретной формы
    async getAllContent(ids) {
      const form = await this.$store.dispatch('form/getFormContent', ids);
      return form;
    },
    // открываем уже существующию форму
    async openForm(name, event) {
      // получаем родителя элемента на который щелкнули
      let element = event.target.parentElement;
      // и пока не "всплывем" до нужного нам родителя
      while (!element.classList.contains('v-list-item')) {
        // обновляем переменную в которой будет нужный нам элемент
        element = element.parentElement;
      }
      // ищем внутри нашего родителя нужный блок
      element = element.querySelector('.loading-bar');
      // и добовляем ему видимость загрузки
      element.classList.add('loading');
      // получаем шаблон из базы данных
      const form = await this.getTemplate(this.idForm);
      // и заносим его в локальное хранилище
      this.$store.commit('form/setTemplate', form.cells);
      // получаем контент из базы данных
      const content = await this.getAllContent({
        idTemplate: this.idForm,
        idForm: name[0],
      });
      // отсекаем два послдених значения ибо это передается мета информация вроде id формы
      content.splice(content.length - 2, 2);
      // но нам нужно сохранить в локальное хранилище объект, а не массив
      const contentObj = {};
      // пробегаемся по всему массиву
      content.forEach((item, i) => {
        if (Number(item)) {
          contentObj[i] = Number(item);
        } else {
          contentObj[i] = item;
        }
      });
      // заносим контент в локальное хранилище
      this.$store.commit('form/setAllContent', contentObj);
      // удаляем класс с загрузкой
      element.classList.remove('loading');
      // переходим на страницу редактирования формы
      this.$router.push(
        `/forms/edit?editable=false&id=${this.idForm}&nameForm=${name[1]}`,
      );
    },
    // мтеод создающий новую форму
    async createFormTemplate(event) {
      let formBlock = event.target;
      while (!formBlock.classList.contains('form-block')) {
        formBlock = formBlock.parentElement;
      }
      const loading = formBlock.querySelector('.loading-bar');
      loading.classList.add('loading');
      // получаем структуру формы
      const form = await this.getTemplate(this.idForm);

      // и заносим его в локальное хранилище
      this.$store.commit('form/setTemplate', form.cells);
      // в контент заносим пустое значение
      this.$store.commit('form/setAllContent', 'empty');
      // включаем кнопку сохранить
      this.$store.commit('form/setDisabled', false);
      loading.classList.remove('loading');
      // и переходим на страницу редактирования
      this.$router.push(
        `/forms/edit?editable=true&id=${this.idForm}&nameForm=Новая форма`,
      );
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/formOpenList.sass';
</style>
