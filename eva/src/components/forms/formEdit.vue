<template>
  <v-app>
    <v-content>
      <div class="form-panel-board">
        <div class="title-name">
          Создать новую форму
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
      <v-container class="edit-form-container">
        <v-card class="form-create-block">
          <div class="title-form">
            {{ nameForm }}
          </div>
          <!-- <div class="form-itself" :style="{gridTemplateRows : `repeat(${createForm.rows}, 1fr)`, gridTemplateColumns: `repeat(${createForm.columns}, 1fr)`}">-->
          <div
            ref="form"
            class="form-itself"
          >
            <grid-layout
              :layout.sync="grid"
              :col-num="columns"
              :row-height="50"
              :is-draggable="false"
              :is-resizable="false"
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
              >
                <div
                  class="form-cell"
                  @click="openToolTip($event)"
                >
                  <div class="elem-cell">
                    <!-- <v-icon class="icon-cell"  color="teal" @click="openModal(item.i)" >{{item.img}}</v-icon>  -->
                    <template-elements-form
                      :id-from="item.i"
                      :height-from="item.h"
                      name-form-from="nameForm"
                      :radios-from="radios"
                      :name-from="item.name"
                      :editable="editable"
                      @setValue="setValue($event)"
                      @checkSwitch="checkSwitch($event)"
                    />
                  </div>
                </div>
              </grid-item>
            </grid-layout>
          </div>
          <div class="form-btn">
            <v-btn
              v-if="editable == 'true'"
              small
              color="teal"
              class="create-form-btn"
              :disabled="false"
              @click="saveForm"
            >
              Сохранить
            </v-btn>
            <!-- <v-btn small color="teal" class="create-form-btn" @click="openForm">Перейти к редактированию</v-btn> -->
          </div>
        </v-card>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
import { mdiHomeVariantOutline } from '@mdi/js';

export default {
  data() {
    return {
      home: mdiHomeVariantOutline,
      grid: [],
      columns: -1,
      radios: {},
      block: {},
      tooltip: null,
    };
  },
  computed: {
    // осоновные параметры, которые часто меняются и которые следует отслеживать
    idForm() {
      // получаем id формы
      return this.$route.query.id;
    },
    idTemplate() {
      //  получаем id шаблона
      return this.$route.query.idTemplate;
    },
    nameForm() {
      // получаем имя шаблона
      return this.$route.query.nameForm;
    },
    editable() {
      // переменная котора ярешает следует ли редактировать форму
      return this.$route.query.editable;
    },
    //  empty: function() {
    //      return this.$route.query.empty
    //  },
    disabled() {
      // переменная которая решает активна ли кнопка Сохранить
      return this.$store.getters['form/getDisabled'];
    },
  },
  mounted() {
    this.getForm(); // при загрузке страницы получаем форму для отрисовки из локального хранилища
  },
  methods: {
    toHome() {
      // метод переключающий нас на домашнию страницу
      this.$router.push('/forms');
    },
    saveForm() {
      // сохраняем форму
      const content = this.$store.getters['form/getAllContent']; // получаем контент формы
      let form_name = this.grid.filter((item) => {
        // определяем имя формы на основе ключегого поля
        if (item.options) {
          return item.options.ident == true;
        }
      })[0].i;
      form_name = content[form_name]; // заносим указанное поле как имя формы

      const form = {
        // создаем объект формы
        template_id: this.idForm, // id шаблона
        form_name, // имя формы
        //  content: newcontent  // контент формы
      };

      this.$store.commit('form/saveForm', form); // сохраняем форму в базу данных
      this.$store.commit('form/setDisabled', true); // отключаем кнопку Сохранить
    },
    async getForm() {
      // получаем данные по форме

      const form = this.$store.getters['form/getFormLocal']; // получаем структуру по форме из локального хранилища
      const content = this.$store.getters['form/getAllContent']; // получаем контент по форме из локального хранилища
      this.grid = form; // заносим объект в перемненую для отрисовки
      this.columns = form.reduce((last, next) => {
        // находим максимальное значение среди всех значений х, чтобы понять сколько колонок у нас будет
        if (next.y == 0) {
          return last + next.w;
        }
        return last;
      }, 0);

      for (let i = 0; i < this.grid.length; i++) {
        // пробегаемся по всем ячейкам
        if (this.grid[i].name == 'Выбор одного варианта') {
          // и если есть ячейки определенного типа
          this.$set(this.radios, i, content[i]); // то выставляем их значение в объект
        }
      }
    },
    setValue(content) {
      // когда поменялось значение ячейки
      this.$store.commit('form/setContent', content); // заносим новое значение в локальное хранилище
    },
    checkSwitch(cellElem) {
      // вызывается когда нажали на radiobtn
      this.radios[cellElem.id] = !this.radios[cellElem.id]; // меняем значение у radiobtn
      this.$refs.form
        .querySelectorAll(`[name="${cellElem.name}"]`)
        .forEach((item) => {
          // ищем все radiobtn с определенным парамтером name
          if (item.getAttribute('data-id') != cellElem.id) {
            // и если этот элемнет не тот на который тыкнули
            this.radios[item.getAttribute('data-id')] = false; // то отключаем их
          }
        });
    },
    openToolTip(event) {
      let block = event.target;
      let tooltip = null;
      while (!block.classList.contains('elem-cell')) {
        block = block.parentElement;
      }

      if (block.querySelector('.toobig')) {
        if (block.querySelector('.tooltip')) {
          block.querySelector('.tooltip').remove();
          block.parentElement.parentElement.style['z-index'] = '1';
        } else {
          const elem = block.querySelector('.element-block-not-editable');
          tooltip = elem.cloneNode(true);
          tooltip.classList.add('tooltip');
          tooltip.style.opacity = '1';
          block.appendChild(tooltip);
          block.parentElement.parentElement.style['z-index'] = '2';
        }
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/formEdit.sass';
</style>
