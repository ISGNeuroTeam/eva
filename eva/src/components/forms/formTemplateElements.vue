<template>
  <div
    ref="elementBlock"
    class="block-of-elements"
  >
    <div
      v-if="editable === 'true'"
      class="element-block"
    >
      <v-textarea
        v-if="visionOpt.text"
        ref="textArea"
        v-model="value"
        color="#333"
        outlined
        placeholder="Текстовое поле"
        :rows="heightFrom"
        :height="heightFrom * 50"
        hide-details
        @blur="setValue"
      />
      <v-select
        v-if="visionOpt.select"
        v-model="value"
        :items="selectElems"
        color="#333"
        hide-details
        outlined
        @change="setValue"
      />
      <div
        v-if="visionOpt.number"
        class="number-block"
      >
        <v-text-field
          v-model="value"
          class="number"
          color="#333"
          outlined
          hide-details
          @blur="checkNumber"
        />
        <div
          class="warning-number-block"
          :class="{ showWarning: showWarning }"
        >
          Только числовое значение
        </div>
      </div>
      <div
        v-if="visionOpt.choose"
        class="radiobtn-block"
        :name="radioname"
        :data-radious="radios"
        :data-id="idFrom"
        :class="{ radioActive: value }"
        @click="checkRadio"
      >
        <div class="radiobtn-circle" />
      </div>
    </div>
    <div
      v-if="editable === 'false'"
      class="element-block-not-editable"
    >
      <div
        v-if="visionOpt.choose"
        class="radiobtn-block"
        :class="{ radioActive: value }"
      >
        <div class="radiobtn-circle" />
      </div>
      <div
        v-if="!visionOpt.choose"
        class="just-text"
      >
        {{ value }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    nameFrom: {
      type: String,
      required: true,
    },
    idFrom: {
      type: String,
      required: true,
    },
    radiosFrom: null,
    // TODO: переделать на Boolean!!!
    editable: {
      type: String,
      required: true,
    },
    heightFrom: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      visionOpt: {
        text: false,
        select: false,
        choose: false,
        number: false,
      },
      selectElems: [],
      value: '',
      showWarning: false,
      radioname: '',
      tooltip: null,
    };
  },
  // осоновные параметры, которые чатсо меняются и которы следует отслеживать
  computed: {
    radios() {
      this.setValue();
      return this.radiosFrom[this.idFrom];
    },
    getContent() {
      if (this.$store.state.form.createForm.content) {
        return this.$store.state.form.createForm.content[this.idFrom];
      }
      return 'empty';
    },
  },

  mounted() {
    const element = this.$store.getters['form/getFormLocal'];
    let content = this.getContent;
    if (content !== 'empty') {
      if (content === 'True') {
        content = true;
      }
      if (content === 'False') {
        content = false;
      }
      if (content === 'None') {
        content = '';
      }
      this.value = content;
    }
    switch (this.nameFrom) {
      case 'Текстовое поле':
        this.visionOpt.text = true;
        break;
      case 'Выпадающий список':
        this.visionOpt.select = true;
        if (element[this.idFrom].options) {
          this.selectElems = element[this.idFrom].options.select.split(';');
        }
        break;
      case 'Выбор одного варианта':
        this.visionOpt.choose = true;
        if (element[this.idFrom].options) {
          if (element[this.idFrom].options.nameRadio) {
            this.radioname = element[this.idFrom].options.nameRadio;
          } else {
            this.radioname = 'empty';
          }
        } else {
          this.radioname = 'empty';
        }
        break;
      case 'Числовое поле':
        this.visionOpt.number = true;
        break;
      default:
        break;
    }
    if (this.editable === 'false') {
      setTimeout(() => {
        const blockell = this.$refs.elementBlock;
        const elemBlock = blockell.querySelector('.element-block-not-editable');

        if (
          elemBlock.getBoundingClientRect().height
          > blockell.getBoundingClientRect().height
        ) {
          elemBlock.style = 'position:absolute;top:5px;left:5px';
          blockell.classList.add('toobig');
        }
      }, 100);
    }
  },
  methods: {
    setValue() {
      this.value = this.radiosFrom[this.idFrom];
      const content = { id: this.idFrom, value: this.value };
      this.$emit('setValue', content);
    },
    checkNumber() {
      if (!Number(this.value)) {
        this.showWarning = true;
        setTimeout(() => {
          this.showWarning = false;
        }, 2000);
      } else {
        this.setValue();
      }
    },
    checkRadio() {
      this.$emit('checkSwitch', { id: this.idFrom, name: this.radioname });
    },
  },
};
</script>

<style lang="scss">
// настройки стилей в файле formEdit.sass
</style>
