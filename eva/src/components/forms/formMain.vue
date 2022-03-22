<template>
  <v-app>
    <v-content>
      <div class="form-panel-board">
        <div class="title-name">
          EVA Формы
        </div>
      </div>
      <!--  Основная страница  -->
      <v-container
        v-if="!permission"
        class="main-form-container"
      >
        <div class="main-form">
          <v-card
            class="form-block"
            @click="openMainRole('admin')"
          >
            <v-card-text class="card-text">
              <p>Администратор</p>
              <v-icon class="role">
                {{ adminRole }}
              </v-icon>
            </v-card-text>
          </v-card>
          <v-card
            class="form-block"
            @click="openMainRole('user')"
          >
            <v-card-text class="card-text">
              <p>Пользователь</p>
              <v-icon class="role">
                {{ userRole }}
              </v-icon>
            </v-card-text>
          </v-card>
        </div>
      </v-container>
      <!--  ---  -->

      <v-container class="main-form-container">
        <v-skeleton-loader
          v-if="loading"
          type="image"
          height="300"
          width="100%"
        />
        <div class="main-form-forms">
          <v-card
            v-for="item in forms"
            :key="item[0]"
            class="form-block"
            @click="openForm(item, permission)"
          >
            <v-card-text class="card-text">
              <p>{{ item[1].toUpperCase() }}</p>
            </v-card-text>
          </v-card>
        </div>
        <div
          v-if="permission === 'admin'"
          class="divider"
        />
        <div
          v-if="permission === 'admin'"
          class="main-form"
        >
          <v-card
            class="form-block"
            @click="createForm()"
          >
            <v-card-text class="card-text">
              <p>Создать новую форму</p>
              <v-icon class="plus">
                {{ plus }}
              </v-icon>
            </v-card-text>
          </v-card>
        </div>
      </v-container>
    </v-content>
    <modal-create-form
      :modal-from="modal"
      @hideForm="createForm"
    />
  </v-app>
</template>

<script>
import { mdiHardHat, mdiHatFedora, mdiPlusCircleOutline } from '@mdi/js';

export default {
  data() {
    return {
      plus: mdiPlusCircleOutline,
      adminRole: mdiHardHat,
      userRole: mdiHatFedora,
      modal: false,
      permissionStatus: '',
      template: true,
      templateName: '',
      forms: [],
      loading: true,
    };
  },
  // осоновные параметры, которые чатсо меняются и которы следует отслеживать
  computed: {
    // позволяет понять в режима администратора вошли или пользователя
    permission() {
      return this.$route.params.id;
    },
  },
  mounted() {
    // если страница не главная, а уже выбран какой-то режим
    if (this.permission) {
      // нужно получить список всех форм
      this.getForms();
    }
  },
  methods: {
    // метод который получает список всех шаблонов из базы данных
    async getForms() {
      // получаем список и заносим его в переменную
      this.forms = await this.$store.dispatch('form/getAllTemplates');
      // отключаем блок с загрузкой
      this.loading = false;
    },
    // открываем модалку с созданием нового шаблона
    createForm() {
      this.modal = !this.modal;
    },
    // открываем существующий шаблон
    openForm(name, permission) {
      // если открывает администратор
      if (permission === 'admin') {
        //  то октрываем сам шаблон для просмотра
        this.$router.push(`/forms/open?editable=false&id=${name[0]}`);
        // если пользователь
      } else {
        // то откроется список форм данного шаблона
        this.$router.push(`/forms/openlist/${name[0]}?name=${name[1]}`);
      }
    },
    // понимаем какой режим нужно отобразить
    openMainRole(role) {
      // в любом случае забираем список форм из базы данных
      this.getForms();
      // и отображаем нужный режим
      this.$router.push(`/forms/${role}`);
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/formMain.sass';
</style>
