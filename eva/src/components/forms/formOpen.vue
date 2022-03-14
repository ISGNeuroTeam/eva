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
              {{ home }}
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
                      :class="{ plusIcon: item.name === '' }"
                      @click="openModal(item.i)"
                    >
                      {{ item.img }}
                    </v-icon>
                    <div class="name-cell">
                      {{ checkName(item.name, item.w, item.h, item.img) }}
                    </div>
                  </div>
                  <v-icon
                    v-if="editable === 'true'"
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
            v-if="editable === 'true'"
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
          </div>
          <div
            v-if="editable === 'false'"
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
  // осоновные параметры, которые часто меняются и которы следует отслеживать
  computed: {
    // получаем объект шаблона из локального хранилища
    createForm() {
      return this.$store.getters['form/getCreateForm'];
    },
    editable() {
      this.setDataEditable();
      // возвращаем саму натсройку редактирования
      return this.$route.query.editable;
    },
    // получаем id шаблона
    idForm() {
      return this.$route.query.id;
    },
    // получаем настройку редактирования кнопки Сохранить
    disabled() {
      return this.$store.getters['form/getDisabled'];
    },
  },
  mounted() {
    // если можно редактировать
    if (this.editable === 'true') {
      // получаем шаблон из локального хранилища
      const form = this.createForm;
      // выставляем название шаблона
      this.titleForm = this.createForm.name;
      // если шаблон был получен из базы данных
      if (form.cells) {
        // то заносим его в переменную для отрисовки
        this.grid = form.cells;
        // и выставляем правлиьное количество колонок,
        // либо по умолчанию, либо то что пришло, умноженное на 4
        this.columns = form.columns !== '' ? Number(form.columns) * 4 : 16;
        // если шаблона нет в базе данных
      } else {
        // то создаем новый
        this.setGrid(form);
      }
      // если редактировать запрещено
    } else {
      // то просто получаем шаблон и отрисовываем его
      this.getForm();
    }
  },
  methods: {
    // получаем настройку сообщающию может ли пользователь редактировать шаблон или нет
    setDataEditable() {
      // если редактировтаь шаблон нельзя
      if (this.$route.query.editable === 'false') {
        // то отключаем возможность редактирования
        this.dargrsizeable = false;
        // и меняем заголовок шаблона
        this.title = 'Просмотр формы';
        // если редактировать разрешено
      } else {
        // включаем настройку редактирования
        this.dargrsizeable = true;
        // отключаем загрузку
        this.loading = false;
        // меняем заголовок
        this.title = 'Создать форму';
      }
    },
    // метод перенаправляющий на главную страницу
    toHome() {
      this.$router.push('/forms');
    },
    // метод сохраняющий позицию и размер ячеек шаблона
    savePosSize() {
      // записываем новую позицию и размер в локальное хранилище
      this.$store.commit('form/setTemplate', this.grid);
    },
    // сохраняем шаблон
    saveForm() {
      // сохраняем шаблон в базу данных
      this.$store.dispatch('form/saveTemplateForm');
      // отключаем кнопку Сохранить
      this.$store.commit('form/setDisabled', true);
    },
    deleteForm() {
      // функция удаления шаблона
      // this.$store.dispatch("form/deleteTemplate",this.idForm);
    },
    checkName(name, w, h) {
      if (w < 4 || h < 3) {
        return ' ';
      }
      return name;
    },
    // функция срабатывающяя когда в модалки выбрали новый элемент
    setElement(elem) {
      // заносим имя
      this.grid[this.elemKey].name = elem[0].name;
      // и картинку нового элемента
      this.grid[this.elemKey].img = elem[0].img;
      // сохраняем шаблон в локальное хранилище
      this.$store.commit('form/setTemplate', this.grid);
    },
    // открываем модалку с выбором элементов
    openModal(key) {
      // открываем модалку
      this.modal = true;
      // сохраняем id ячейки для дальнйшего использования
      this.elemKey = key;
    },
    // открываем модалку с настройками ячейки
    openModalSetting(key) {
      // открываем модалку
      this.modalSettings = true;
      // в объект натсроек заносим id ячейки
      this.forSettingsForm.key = key;
      // и имя элемнета в ячейке
      this.forSettingsForm.name = this.grid[key].name;
      // и сохраняем id ячейки еще в другую переменную
      this.elemKey = key;
    },
    // закрываем все открытые модалки
    closeModal() {
      this.modal = false;
      this.modalSettings = false;
    },
    // получаем шаблон из базы данных
    async getForm() {
      // получаем собственно шаблон
      const form = await this.$store.dispatch('form/getTemplate', this.idForm);
      // находим максимальное значение среди всех значений х,
      // чтобы понять сколько колонок у нас будет
      const max = form.cells.reduce((last, next) => {
        if (next.y === 0) {
          return last + next.w;
        }
        return last;
      }, 0);
      // выставляем заголовок шаблона
      this.titleForm = form.name;
      // заносим структуру шаблона в переменную для отображения
      this.grid = form.cells;
      this.columns = max;
      // отключаем загрузку
      this.loading = false;
    },
    // создаем шаблон в первый раз
    setGrid() {
      let x = 0;
      let y = 0;
      this.grid = [];
      // если число строк введено пользователем, то используем их, если нет ставим по умолчанию
      this.rows = this.createForm.rows !== '' ? Number(this.createForm.rows) : 2;
      // тоже самое с колонками
      this.columns = this.createForm.columns !== '' ? Number(this.createForm.columns) : 4;
      // пробегаемся по всем записям в объекте шаблоне
      for (let i = 0; i < this.rows * this.columns; i += 1) {
        // если х превысил количество х в строке
        if (x > this.columns * 4 - 4) {
          // то сбрасываем условный счетчик колонок
          x = 0;
          // и переходим на следующию строку
          y += 4;
        }
        // добовляем строку в объект шаблона
        this.$set(this.grid, i, {
          x,
          y,
          w: 4,
          h: 4,
          i: String(i),
          name: '',
          img: this.plus,
        });
        // после каждой итерации сдвигаем как бы указатель вправо на ширину колонки
        x += 4;
      }
      // умножаем число колонок на 4 как бы разбивая каждую из них на четыре части
      this.columns *= 4;
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/formOpen.sass';
</style>
