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
              {{ home }}
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
              v-if="editable === 'true'"
              small
              color="teal"
              class="create-form-btn"
              :disabled="false"
              @click="saveForm"
            >
              Сохранить
            </v-btn>
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
  // осоновные параметры, которые часто меняются и которые следует отслеживать
  computed: {
    // получаем id формы
    idForm() {
      return this.$route.query.id;
    },
    //  получаем id шаблона
    idTemplate() {
      return this.$route.query.idTemplate;
    },
    // получаем имя шаблона
    nameForm() {
      return this.$route.query.nameForm;
    },
    // переменная котора ярешает следует ли редактировать форму
    editable() {
      return this.$route.query.editable;
    },
    //  empty: function() {
    //      return this.$route.query.empty
    //  },
    // переменная которая решает активна ли кнопка Сохранить
    disabled() {
      return this.$store.getters['form/getDisabled'];
    },
  },
  mounted() {
    // при загрузке страницы получаем форму для отрисовки из локального хранилища
    this.getForm();
  },
  methods: {
    // метод переключающий нас на домашнию страницу
    toHome() {
      this.$router.push('/forms');
    },
    // сохраняем форму
    saveForm() {
      // получаем контент формы
      const content = this.$store.getters['form/getAllContent'];
      // определяем имя формы на основе ключегого поля
      // eslint-disable-next-line camelcase
      let form_name = this.grid
        .filter((item) => (item.options ? !!item.options.ident : false))[0].i;
      // заносим указанное поле как имя формы
      // eslint-disable-next-line camelcase
      form_name = content[form_name];

      // создаем объект формы
      const form = {
        template_id: this.idForm, // id шаблона
        form_name, // имя формы
        //  content: newcontent  // контент формы
      };

      // сохраняем форму в базу данных
      this.$store.dispatch('form/saveForm', form);
      // отключаем кнопку Сохранить
      this.$store.commit('form/setDisabled', true);
    },
    // получаем данные по форме
    async getForm() {
      // получаем структуру по форме из локального хранилища
      const form = this.$store.getters['form/getFormLocal'];
      // получаем контент по форме из локального хранилища
      const content = this.$store.getters['form/getAllContent'];
      // заносим объект в перемненую для отрисовки
      this.grid = form;
      // находим максимальное значение среди всех значений х,
      // чтобы понять сколько колонок у нас будет
      this.columns = form.reduce((last, next) => {
        if (next.y === 0) {
          return last + next.w;
        }
        return last;
      }, 0);

      // пробегаемся по всем ячейкам
      for (let i = 0; i < this.grid.length; i += 1) {
        // и если есть ячейки определенного типа
        if (this.grid[i].name === 'Выбор одного варианта') {
          // то выставляем их значение в объект
          this.$set(this.radios, i, content[i]);
        }
      }
    },
    // когда поменялось значение ячейки
    setValue(content) {
      // заносим новое значение в локальное хранилище
      this.$store.commit('form/setContent', content);
    },
    // вызывается когда нажали на radiobtn
    checkSwitch(cellElem) {
      // меняем значение у radiobtn
      this.radios[cellElem.id] = !this.radios[cellElem.id];
      // ищем все radiobtn с определенным парамтером name
      this.$refs.form
        .querySelectorAll(`[name="${cellElem.name}"]`)
        .forEach((item) => {
          // и если этот элемнет не тот на который тыкнули
          if (item.getAttribute('data-id') !== cellElem.id) {
            // то отключаем их
            this.radios[item.getAttribute('data-id')] = false;
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
