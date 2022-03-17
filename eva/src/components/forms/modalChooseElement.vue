<template>
  <v-dialog
    v-model="modal"
    width="550"
    persistent
  >
    <!--  <div class="create-modal-block" :class={create_warning:create_warning} > -->
    <div class="choose-modal-form-block">
      <v-card>
        <v-card-text
          class="headline"
        >
          <div class="choose-title">
            Выберите тип ячейки
          </div>
        </v-card-text>
        <div
          ref="elemBlock"
          class="elements-block"
        >
          <div
            v-for="element in elements"
            :key="element.name"
            class="element"
            @click="selectElem($event)"
          >
            <v-icon
              class="element-img"
              color="teal"
            >
              {{ element.img }}
            </v-icon>
            <div class="element-name">
              {{ element.name }}
            </div>
          </div>
        </div>
        <v-card-actions>
          <v-spacer />
          <v-btn
            small
            color="teal"
            class="create-btn"
            @click="acceptBtn"
          >
            Подтвердить
          </v-btn>
          <v-btn
            small
            color="#FF6D70"
            class="create-btn"
            @click="cancelModal"
          >
            Отмена
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>

<script>
import {
  mdiFormatListBulleted, mdiFormatTextVariant, mdiNumeric, mdiRadioboxMarked,
} from '@mdi/js';

export default {
  props: {
    modalFrom: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      elements: [
        { name: 'Текстовое поле', img: mdiFormatTextVariant },
        { name: 'Числовое поле', img: mdiNumeric },
        { name: 'Выпадающий список', img: mdiFormatListBulleted },
        { name: 'Выбор одного варианта', img: mdiRadioboxMarked },
      ],
      choose: {},
    };
  },
  // осоновные параметры, которые чатсо меняются и которы следует отслеживать
  computed: {
    modal() {
      return this.modalFrom;
    },
  },
  methods: {
    acceptBtn() {
      this.$emit('setElement', this.choose);
      this.cancelModal();
    },
    // функция для выбора одного элемента из списка
    selectElem(event) {
      let elem = event.target;

      while (!elem.classList.contains('element')) {
        elem = event.target.parentElement;
      }
      // пробегаемся по всем элементам
      // и отключаем  обводку
      this.$refs.elemBlock.childNodes.forEach((item) => {
        item.style = 'box-shadow: none';
      });
      elem.style = 'box-shadow: 0px 0px 4px 3px  #FF6D70';
      const name = elem.querySelector('.element-name').textContent;
      this.choose = this.elements.filter((item) => item.name === name);
    },
    cancelModal() {
      this.$emit('hideForm');
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/modalChooseElement.sass';
</style>
