<template>
  <div>
    <div class="importantExport d-flex align-center">
      <v-file-input
        :color="theme.$accent_ui_color"
        :style="{ color: theme.$main_text, fill: theme.$main_text }"
        class="file-itself"
        hide-details
        outlined
        label="Выберите файл"
        @change="file = $event"
      />
      <v-btn
        class="ml-2"
        :disabled="!file"
        @click="importForm"
      >
        import
      </v-btn>
      <v-btn
        class="ml-2"
        @click="exportForm"
      >
        export
      </v-btn>
    </div>
    <codemirror
      ref="myCm"
      v-model="code"
      :options="cmOptions"
      @keyup.native.shift.ctrl.76="formatRange"
      @ready="refresh"
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
    elemName: {
      type: String,
      required: true,
    },
    importantExport: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      file: null,
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
      this.refresh();
    },
  },
  mounted() {
    if (this.isDarkTheme) {
      this.cmOptions.theme = 'eva-dark';
    } else {
      this.cmOptions.theme = 'eva';
    }
    setTimeout(() => {
      this.formatRange();
    }, 0);
  },
  methods: {
    readFile(callback) {
      const rawFile = new XMLHttpRequest();
      rawFile.overrideMimeType('application/json');
      rawFile.open('GET', this.file, true);
      rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4 && rawFile.status === '200') {
          callback(rawFile.responseText);
        }
      };
      rawFile.send(null);
    },
    importForm() {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.code = event.target.result;
      };
      reader.readAsText(this.file);
    },
    exportForm() {
      const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(this.code)}`;
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `${this.elemName}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    },
    formatRange(event) {
      try {
        this.incorrectJSON = false;
        if (this.code) {
          this.code = JSON.stringify(JSON.parse(this.code), null, 4);
        }
        this.refresh();
      } catch (error) {
        this.incorrectJSON = true;
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

<style lang="scss">
@import 'codemirror/lib/codemirror';
@import 'codemirror/addon/lint/lint';
@import './../sass/codeHighlightEva';
@import './../sass/codeHighlightEvaDark';

.importantExport {
  margin-bottom: 30px;
}

.CodeMirror {
  border: 1px solid #eee;
  height: auto;
}

.textarea {
  max-height: 420px;
  overflow: auto;
}

</style>
