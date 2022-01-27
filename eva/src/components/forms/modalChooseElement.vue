<template>
  <v-dialog v-model="modal" width="550" persistent>
    <!--  <div class="create-modal-block" :class={create_warning:create_warning} > -->
    <div class="choose-modal-form-block">
      <v-card>
        <v-card-text class="headline"
          ><div class="choose-title">Выберите тип ячейки</div></v-card-text
        >
        <div ref="elemBlock" class="elements-block">
          <div
            v-for="element in elements"
            :key="element.name"
            class="element"
            @click="selectElem($event)"
          >
            <v-icon class="element-img" color="teal">{{ element.img }}</v-icon>
            <div class="element-name">{{ element.name }}</div>
          </div>
        </div>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small color="teal" class="create-btn" @click="acceptBtn"
            >Подтвердить</v-btn
          >
          <v-btn small color="#FF6D70" class="create-btn" @click="cancelModal"
            >Отмена</v-btn
          >
        </v-card-actions>
      </v-card>
      <!-- <div class="warning-block" :style="{background:color.backElement}">
                    <div class="warning-text"  :style="{color:color.text}">Такой DashBoard существует. Хотите заменить его?</div>
                    <div class="btn-warning"> 
                        <v-btn small :color="color.controls" class="warning-btn" @click="yesDashBoards">Да</v-btn>
                        <v-btn small :color="color.controlsActive" class="warning-btn" @click="noDashBoards">Нет</v-btn>
                    </div>
        </div> -->
    </div>
  </v-dialog>
</template>

<script>
import {
  mdiFormatTextVariant,
  mdiNumeric,
  mdiFormatListBulleted,
  mdiRadioboxMarked,
} from '@mdi/js';

export default {
  props: {
    modalFrom: null,
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
  computed: {
    // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    modal: function () {
      return this.modalFrom;
    },
  },
  methods: {
    acceptBtn: function () {
      this.$emit('setElement', this.choose);
      this.cancelModal();
    },
    selectElem: function (event) {
      // функция для выбора одного элемента из списка

      let elem = event.target;

      while (!elem.classList.contains('element')) {
        elem = event.target.parentElement;
      }
      this.$refs.elemBlock.childNodes.forEach((item) => {
        // пробегаемся по всем элементам
        item.style = 'box-shadow: none'; // и отключаем  обводку
      });
      elem.style = `box-shadow: 0px 0px 4px 3px  #FF6D70`;
      let name = elem.querySelector('.element-name').textContent;
      let result = this.elements.filter((item) => {
        return item.name == name;
      });
      this.choose = result;
      //   let elem = event.target.parentElement; // получаем родителя в котором находятся все элементы
      //   elem.parentElement.childNodes.forEach( item => {  // пробегаемся по всем элементам
      //       item.style = 'box-shadow: none';  // и отключаем  обводку
      //   });
      //   this.currentId = elem.querySelector('.search-id').innerHTML; // затем получаем текст всего ИС который выбрали
      //   elem.style = `box-shadow: 0px 0px 4px 3px  ${this.color.controlsActive}`;  // и делаем ему обводку
    },
    cancelModal: function () {
      this.$emit('hideForm');
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/modalChooseElement.sass';
</style>
