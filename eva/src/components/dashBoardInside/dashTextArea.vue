<template>
  <portal
    :to="idFrom"
    :disabled="!fullScreenMode"
  >
    <div
      :style="customStyle"
      :class="customClass"
      v-bind="$attrs"
      class="dash-textArea"
    >
      <v-textarea
        v-model="textarea"
        :color="color.controls"
        outlined
        :style="{
          color: color.text,
          fontWeight: getOptions.fontWeight,
          fontSize: `${getOptions.textFontSize}px`,
        }"
        spellcheck="false"
        hide-details
        class="textarea-itself"
        :readonly="readOnly"
        :height="height"
        no-resize
        @keypress="setTockenByPress($event)"
        @blur="setTockenBlur($event)"
        @change="onInputText"
        @keyup="onKeyUpText"
      />
      <v-btn
        v-if="searchBtn"
        small
        :color="color.controls"
        class="accept-btn"
        @click="acceptTextArea"
      >
        <v-icon>
          {{ searchIcon }}
        </v-icon>
      </v-btn>
    </div>
  </portal>
</template>

<script>
import { mdiMagnify } from '@mdi/js';
import defaultSourceData from '../../mixins/defaultSourceData';

export default {
  name: 'DashTextarea',
  mixins: [
    defaultSourceData,
  ],
  props: {
    // переменные полученные от родителя
    idFrom: {
      type: String,
      required: true,
    }, // id элемнета (table, graph-2)
    idDashFrom: {
      type: String,
      required: true,
    }, // id дашборда
    colorFrom: {
      type: Object,
      required: true,
    }, // цветовые переменные
    fullScreenMode: {
      type: Boolean,
      default: false,
    },
    sizeFrom: {
      type: Object,
      required: true,
    },
    customStyle: {
      type: Object,
      default: () => ({}),
    },
    customClass: {
      type: String,
      default: '',
    },
    dataSources: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      actions: [{ name: 'accept', capture: [] }],
      textarea: '',
      searchIcon: mdiMagnify,
    };
  },
  computed: {
    // осоновные параметры, которые чатсо меняются и которы следует отслеживать
    id() {
      return this.idFrom;
    },
    idDash() {
      return this.idDashFrom;
    },
    color() {
      return this.colorFrom;
    },
    rows() {
      let rowsCount = 20;
      if (window.screen.width < 1400) {
        rowsCount = 15;
      }
      if (window.screen.width > 1920) {
        rowsCount = 25;
      }
      return Math.floor((this.sizeFrom.height - 200) / rowsCount);
    },
    height() {
      const margin = window.screen.width < 1600 ? 45 : 55;
      return `${this.sizeFrom.height - margin}px`;
    },
    getOptions() {
      if (!this.idDash) {
        return [];
      }
      if (!this.dashFromStore.options) {
        this.$store.commit('setDefaultOptions', { id: this.id, idDash: this.idDash });
      }

      if (!this.dashFromStore?.options.pinned) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'pinned',
          value: false,
        }]);
      }

      return this.dashFromStore.options;
    },
    searchBtn() {
      const options = this.getOptions;
      return options.searchBtn;
    },
    readOnly() {
      const options = this.getOptions;
      return options.readOnly;
    },
    textAreaValue() {
      return this.getTextArea;
    },
    dashFromStore() {
      return this.$store.state[this.idDash][this.id];
    },
    getTextArea() {
      if (!this.dashFromStore.textarea) {
        return '';
      }
      return this.dashFromStore.textarea;
    },
    // Стктус загрузки ИД для дефолтного значения
    changedDataDefaultLoading() {
      const {
        defaultFromSourceData = null,
        defaultSourceDataUpdates = false,
      } = this.dashFromStore.options;
      if (defaultFromSourceData !== null && defaultSourceDataUpdates) {
        const {
          loading,
        } = this.dataSources[defaultFromSourceData];
        return loading;
      }
      return true;
    },
  },
  watch: {
    textAreaValue(val) {
      this.textarea = this.replaceLineWrapForTextarea(val);
    },
    'dashFromStore.options.validationType': {
      immediate: true,
      handler(val) {
        if (val) {
          this.onInputText(this.textarea);
          this.setTocken();
        }
      },
    },
    'dashFromStore.options.defaultFromSourceData': {
      deep: true,
      handler() {
        this.setTockenBlur();
      },
    },
    // Загрузился ИД для дефотла
    changedDataDefaultLoading(val, oldVal) {
      if (val === false && val !== oldVal) {
        const defaultValue = this.getDefaultValue();
        if (defaultValue !== null) {
          this.textarea = `${defaultValue}`;
        }
        this.setTockenBlur();
      }
    },
  },
  mounted() {
    this.$emit('hideDS', this.id);
    this.textarea = this.replaceLineWrapForTextarea(`${this.getTextArea}`);
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
  },
  methods: {
    replaceLineWrapForToken(text) {
      return text.replaceAll('\n', '<br/>');
    },
    replaceLineWrapForTextarea(text) {
      return text.replaceAll('<br/>', '\n');
    },
    setTockenBlur(event = null) {
      if (event) {
        event.preventDefault();
      }
      if (this.textarea === '') {
        const defaultValue = this.getDefaultValue();
        if (defaultValue !== null) {
          this.textarea = this.replaceLineWrapForTextarea(`${defaultValue}`);
        }
      }
      if (this.dashFromStore.textarea !== this.textarea) {
        const replacedText = this.replaceLineWrapForToken(`${this.textarea}`);
        this.$store.commit('setTextArea', {
          idDash: this.idDash,
          id: this.id,
          textarea: replacedText,
        });
        this.setTocken();
      }
    },
    onKeyUpText() {
      const { options } = this.dashFromStore;
      if (options?.validationType === 'numberRange') {
        const num = this.textarea.match(/^-?(\d+)?(\.)?(\d+)?/);
        this.textarea = num ? num[0] : '';
      }
    },
    onInputText(val) {
      const { options } = this.dashFromStore;
      if (options?.validationType === 'numberRange') {
        const {
          validationNumberRangeMin,
          validationNumberRangeMax,
        } = options;
        const min = parseFloat(validationNumberRangeMin);
        const max = parseFloat(validationNumberRangeMax);
        let numberValue = parseFloat(val);
        if (Number.isNaN(numberValue)) {
          numberValue = '';
        } else {
          if (numberValue < min) {
            numberValue = min;
          }
          if (numberValue > max) {
            numberValue = max;
          }
        }
        this.textarea = `${numberValue}`;
      }
    },
    acceptTextArea() {
      if (this.dashFromStore.textarea !== this.textarea) {
        const replacedText = this.replaceLineWrapForToken(`${this.textarea}`);
        this.$store.commit('setTextArea', {
          idDash: this.idDash,
          id: this.id,
          textarea: replacedText,
        });
        this.setTocken();
      }
    },
    setTockenByPress(event) {
      if (event.ctrlKey && event.code === 'Enter') {
        event.preventDefault();
        this.acceptTextArea();
      }
    },
    setTocken() {
      const { tockens } = this.$store.state[this.idDash];
      if (tockens) {
        let name = '';
        let currentTokenValue = '';
        tockens.forEach((token) => {
          if (token.elem === this.id && token.action === 'accept') {
            name = token.name;
            currentTokenValue = token?.value || '';
          }
        });
        const textarea = this.replaceLineWrapForToken(`${this.textarea}`);
        const token = {
          name,
          action: 'accept',
          capture: '',
        };
        this.$store.commit('setTocken', {
          token,
          idDash: this.idDash,
          value: textarea,
          store: this.$store,
        });
      }
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashTextArea.sass';
</style>
