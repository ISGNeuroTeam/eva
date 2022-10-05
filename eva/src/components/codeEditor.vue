<template>
  <div>
    <codemirror
      ref="myCm"
      v-model="code"
      :options="cmOptions"
      @keyup.native="formatRange"
    />
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror';
// Linter
import jsonlint from 'jsonlint';
import 'codemirror/mode/javascript/javascript.js';
// Code-highlight
import '../js/codeMirror/codeHighlight.js';
// Linter
import 'codemirror/addon/lint/lint.js';
import 'codemirror/addon/lint/json-lint.js';
// Theme
import { isDarkColor } from '@/js/colorutility/isDarkColor';

window.jsonlint = jsonlint;

export default {
  components: {
    codemirror,
  },
  model: {
    prop: 'modelValue',
    event: 'update:model-value',
  },
  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      test: '',
      cmOptions: {
        // codemirror options
        tabSize: 4,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-lint-markers'],
        lineWrapping: true,
        mode: {
          name: 'javascript',
          json: true,
        },
        theme: 'eva-dark',
        lineNumbers: true,
        line: true,
        lint: true,
      },
      isError: false,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
    isDarkTheme() {
      return isDarkColor(this.theme.$secondary_bg);
    },
    code: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:model-value', value);
      },
    },
    incorrectJSON: {
      get() {
        return this.isError;
      },
      set(val) {
        this.isError = val;
      },
    },
  },
  watch: {
    isDarkTheme(val) {
      // eslint-disable-next-line no-unused-expressions
      val ? this.cmOptions.theme = 'eva-dark' : this.cmOptions.theme = 'eva';
    },
  },
  mounted() {
    if (this.isDarkTheme) {
      this.cmOptions.theme = 'eva-dark';
    } else {
      this.cmOptions.theme = 'eva';
    }
  },
  methods: {
    formatRange(event) {
      if (event.ctrlKey && event.shiftKey && event.keyCode === 76) {
        try {
          this.incorrectJSON = false;
          if (this.code) {
            this.code = JSON.stringify(JSON.parse(this.code), null, 4);
          }
          this.refresh();
        } catch (error) {
          this.incorrectJSON = true;
        }
      }
    },
    refresh() {
      // Временный костыль, т.к. не отрабатывает через this.$nextTick()
      setTimeout(() => {
        this.$refs.myCm.refresh();
      }, 500);
    },
  },
};
</script>

<style lang="sass">
@import 'codemirror/lib/codemirror'
@import 'codemirror/addon/lint/lint'
@import ./../sass/codeHighlightEva
@import ./../sass/codeHighlightEvaDark

.CodeMirror
  border: 1px solid #eee
  height: auto

.textarea
  max-height: 420px
  overflow: auto

</style>
