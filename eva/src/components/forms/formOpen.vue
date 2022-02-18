<template>
  <v-app>
    <v-content>
      <div class="form-panel-board">
        <div class="title-name">
          {{ title }}
        </div>
        <v-tooltip
          bottom
          color="#FF6D70"
        >
          <template v-slot:activator="{ on }">
            <v-icon
              class="home"
              color="teal"
              v-on="on"
              @click="toHome"
            >
              {{
                home
              }}
            </v-icon>
          </template>
          <span>На главную</span>
        </v-tooltip>
      </div>
      <v-container class="create-form-container">
        <v-card class="form-create-block">
          <v-skeleton-loader
            v-if="loading"
            type="image"
            height="500"
            width="100%"
          />
          <div class="title-form">
            {{ titleForm }}
          </div>
          <!-- <div class="form-itself" :style="{gridTemplateRows : `repeat(${createForm.rows}, 1fr)`, gridTemplateColumns: `repeat(${createForm.columns}, 1fr)`}">-->
          <div class="form-itself">
            <grid-layout
              :layout.sync="grid"
              :col-num="columns"
              :row-height="50"
              :is-draggable="dargrsizeable"
              :is-resizable="dargrsizeable"
              :is-mirrored="false"
              :vertical-compact="true"
              :use-css-transforms="true"
              :margin="[0, 0]"
            >
              <grid-item
                v-for="item in grid"
                :key="item.i"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.i"
                class="grid-item"
                @moved="savePosSize"
                @resized="savePosSize"
              >
                <div
                  class="form-cell"
                  :class="{ vertical: item.w < 3 }"
                >
                  <div class="elem-cell">
                    <v-icon
                      class="icon-cell"
                      color="teal"
                      :class="{ plusIcon: item.name == '' }"
                      @click="openModal(item.i)"
                    >
                      {{ item.img }}
                    </v-icon>
                    <div class="name-cell">
                      {{ checkName(item.name, item.w, item.h, item.img) }}
                    </div>
                  </div>
                  <!-- <v-icon class="icon-select" v-if="editable=='true'" color="teal" @click="openModal(item.i)">{{pencil}}</v-icon>  -->
                  <v-icon
                    v-if="editable == 'true'"
                    class="icon-gear"
                    color="teal"
                    @click="openModalSetting(item.i)"
                  >
                    {{ gear }}
                  </v-icon>
                </div>
              </grid-item>
            </grid-layout>
          </div>
          <div
            v-if="editable == 'true'"
            class="form-btn"
          >
            <v-btn
              small
              color="teal"
              class="create-form-btn"
              :disabled="disabled"
              @click="saveForm"
            >
              Сохранить
            </v-btn>
            <!-- <v-btn small color="teal" class="create-form-btn" @click="openForm" :disabled="followDisabled">Перейти к редактированию</v-btn> -->
          </div>
          <div
            v-if="editable == 'false'"
            class="form-btn-not-editable"
          >
            <v-btn
              small
              color="#FF6D70"
              class="create-form-btn"
              @click="deleteForm"
            >
              Удалить
            </v-btn>
          </div>
        </v-card>
      </v-container>
      <modal-choose-element
        :modal-from="modal"
        @hideForm="closeModal"
        @setElement="setElement($event)"
      />
      <modal-setting-form
        :modal-from="modalSettings"
        :settings-from="forSettingsForm"
        @hideForm="closeModal"
      />
    </v-content>
  </v-app>
</template>

<script>
import {
  mdiPlusCircleOutline,
  mdiHomeVariantOutline,
  mdiPencil,
  mdiSettings,
} from '@mdi/js';

export default {
  data() {
    return {
      plus: mdiPlusCircleOutline,
      home: mdiHomeVariantOutline,
      pencil: mdiPencil,
      gear: mdiSettings,
      grid: [],
      modal: false,
      modalSettings: false,
      elemKey: -1,
      rows: -1,
      columns: -1,
      forSettingsForm: {},
      dargrsizeable: true,
      title: 'Создать форму',
      titleForm: '',
      loading: true,
    };
  },
  computed: {
    // осоновные параметры, которые часто меняются и которы следует отслеживать
    createForm() {
      // получаем объект шаблона из локального хранилища
      return this.$store.getters['form/getCreateForm'];
    },
    editable() {
      this.setDataEditable();
      return this.$route.query.editable; // возвращаем саму натсройку редактирования
    },
    idForm() {
      // получаем id шаблона
      return this.$route.query.id;
    },
    disabled() {
      // получаем настройку редактирования кнопки Сохранить
      return this.$store.getters['form/getDisabled'];
    },
  },
  mounted() {
    if (this.editable == 'true') {
      // если можно редактировать
      const form = this.createForm; // получаем шаблон из локального хранилища
      this.titleForm = this.createForm.name; // выставляем название шаблона
      if (form.cells) {
        // если шаблон был получен из базы данных
        this.grid = form.cells; // то заносим его в переменную для отрисовки
        form.columns != ''
          ? (this.columns = Number(form.columns) * 4)
          : (this.columns = 16); // и выставляем правлиьное количество колонок, либо по умолчанию, либо то что пришло, умноженное на 4
      } else {
        // если шаблона нет в базе данных
        this.setGrid(form); // то создаем новый
      }
    } else {
      // если редактировать запрещено
      this.getForm(); // то просто получаем шаблон и отрисовываем его
    }
  },
  methods: {
    setDataEditable() {
      // получаем настройку сообщающию может ли пользователь редактировать шаблон или нет
      if (this.$route.query.editable == 'false') {
        // если редактировтаь шаблон нельзя
        this.dargrsizeable = false; // то отключаем возможность редактирования
        this.title = 'Просмотр формы'; // и меняем заголовок шаблона
      } else {
        // если редактировать разрешено
        this.dargrsizeable = true; // включаем настройку редактирования
        this.loading = false; // отключаем загрузку
        this.title = 'Создать форму'; // меняем заголовок
      }
    },
    toHome() {
      // метод перенаправляющий на главную страницу
      this.$router.push('/forms');
    },
    savePosSize() {
      // метод сохраняющий позицию и размер ячеек шаблона
      this.$store.commit('form/setTemplate', this.grid); // записываем новую позицию и размер в локальное хранилище
    },
    saveForm() {
      // сохраняем шаблон
      this.$store.commit('form/saveTemplateForm'); // сохраняем шаблон в базу данных
      this.$store.commit('form/setDisabled', true); // отключаем кнопку Сохранить
    },
    deleteForm() {
      // функция удаления шаблона
      // this.$store.commit("form/deleteTemplate",this.idForm);
    },
    checkName(name, w, h) {
      if (w < 4 || h < 3) {
        return ' ';
      }
      return name;
    },
    //    openForm: function() {
    //        this.$router.push(`/forms/edit?editable=true&id=${this.createForm.name}&empty=false`);
    //    },
    setElement(elem) {
      // функция срабатывающяя когда в модалки выбрали новый элемент
      this.grid[this.elemKey].name = elem[0].name; // заносим имя
      this.grid[this.elemKey].img = elem[0].img; // и картинку нового элемента
      this.$store.commit('form/setTemplate', this.grid); // сохраняем шаблон в локальное хранилище
    },
    openModal(key) {
      // открываем модалку с выбором элементов
      // if (this.editable == 'true') {
      this.modal = true; // открываем модалку
      this.elemKey = key; // сохраняем id ячейки для дальнйшего использования
      // }
    },
    openModalSetting(key) {
      // открываем модалку с настройками ячейки
      this.modalSettings = true; // открываем модалку
      this.forSettingsForm.key = key; // в объект натсроек заносим id ячейки
      this.forSettingsForm.name = this.grid[key].name; // и имя элемнета в ячейке
      this.elemKey = key; // и сохраняем id ячейки еще в другую переменную
    },
    closeModal() {
      // закрываем все открытые модалки
      this.modal = false;
      this.modalSettings = false;
    },
    async getForm() {
      // получаем шаблон из базы данных
      const form = await this.$store.getters['form/getTemplate'](this.idForm); // получаем собственно шаблон
      const max = form.cells.reduce((last, next) => {
        // находим максимальное значение среди всех значений х, чтобы понять сколько колонок у нас будет
        if (next.y == 0) {
          return last + next.w;
        }
        return last;
      }, 0);
      this.titleForm = form.name; // выставляем заголовок шаблона
      this.grid = form.cells; // заносим структуру шаблона в переменную для отображения
      this.columns = max;
      this.loading = false; // отключаем загрузку
    },
    setGrid() {
      // создаем шаблон в первый раз
      let x = 0;
      let y = 0;
      this.grid = [];
      this.createForm.rows != ''
        ? (this.rows = Number(this.createForm.rows))
        : (this.rows = 2); // если число строк введено пользователем, то используем их, если нет ставим по умолчанию
      this.createForm.columns != ''
        ? (this.columns = Number(this.createForm.columns))
        : (this.columns = 4); // тоже самое с колонками
      for (let i = 0; i < this.rows * this.columns; i++) {
        // пробегаемся по всем записям в объекте шаблоне
        if (x > this.columns * 4 - 4) {
          // если х превысил количество х в строке
          x = 0; // то сбрасываем условный счетчик колонок
          y += 4; // и переходим на следующию строку
        }
        this.$set(this.grid, i, {
          x,
          y,
          w: 4,
          h: 4,
          i: String(i),
          name: '',
          img: this.plus,
        }); // добовляем строку в объект шаблона
        x += 4; // после каждой итерации сдвигаем как бы указатель вправо на ширину колонки
      }
      this.columns *= 4; // умножаем число колонок на 4 как бы разбивая каждую из них на четыре части
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/formOpen.sass';
</style>
