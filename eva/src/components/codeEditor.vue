<template>
  <div>
    <button @click="formatRange">
      formatRange
    </button>
    <codemirror
      ref="myCm"
      v-model="code"
      :options="cmOptions"
    />
  </div>
</template>

<script>
import { codemirror } from 'vue-codemirror';
import 'codemirror/mode/javascript/javascript.js';
import '../js/codeMirror/codeHighlight.js';
import 'codemirror/addon/fold/foldgutter.css';
import 'codemirror/addon/fold/foldgutter.js';
import 'codemirror/addon/fold/foldcode.js';
import 'codemirror/addon/fold/indent-fold.js';
import 'codemirror/addon/merge/merge.js';
import { isDarkColor } from '@/js/colorutility/isDarkColor';

// eslint-disable-next-line
const { CodeMirror } = window;

// CodeMirror.extendMode('javascript', {
//   newlineAfterToken(type, content, textAfter, state) {
//     const isObject = /{$/.test(content) || /^}/.test(textAfter);
//     const isArray = /\[$/.test(content) || /^]/.test(textAfter);
//     console.group();
//     console.log('type, content, textAfter, state', type, content, textAfter, state);
//     console.log('isObject', isObject);
//     console.log('isArray', isArray);
//     console.groupEnd();
//     return (isObject || isArray);
//   },
// });

// Applies automatic formatting to the specified range
// CodeMirror.defineExtension('autoFormatRange', function (from, to) {
//   const cm = this;
//   const outer = cm.getMode(); const
//     text = cm.getRange(from, to).split('\n');
//   const state = CodeMirror.copyState(outer, cm.getTokenAt(from).state);
//   const tabSize = cm.getOption('tabSize');
//
//   let out = '';
//   let lines = 0;
//   let atSol = from.ch === 0;
//   function newline() {
//     out += '\n';
//     atSol = true;
//     lines += 1;
//   }
//
//   for (let i = 0; i < text.length; i += 1) {
//     const stream = new CodeMirror.StringStream(text[i], tabSize);
//     while (!stream.eol()) {
//       const inner = CodeMirror.innerMode(outer, state);
//       const style = outer.token(stream, state); const
//         cur = stream.current();
//       stream.start = stream.pos;
//       if (!atSol || /\S/.test(cur)) {
//         out += cur;
//         atSol = false;
//       }
//       if (
//         !atSol
//           && inner.mode.newlineAfterToken
//           && inner.mode.newlineAfterToken(
//             style,
//             cur,
//             stream.string.slice(stream.pos) || text[i + 1] || '',
//             inner.state,
//           )) newline();
//     }
//     if (!stream.pos && outer.blankLine) outer.blankLine(state);
//     if (!atSol && i < text.length - 1) newline();
//   }
//
//   cm.operation(() => {
//     cm.replaceRange(out, from, to);
// eslint-disable-next-line
//     for (let cur = from.line + 1, end = from.line + lines; cur <= end; cur += 1) cm.indentLine(cur, 'smart');
//     cm.setSelection(from, cm.getCursor(false));
//   });
// });

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
      cmOptions: {
        // codemirror options
        tabSize: 4,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        lineWrapping: true,
        mode: 'text/javascript',
        theme: 'eva-dark',
        lineNumbers: true,
        line: true,
      },
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
  },
  watch: {
    isDarkTheme(val) {
      // eslint-disable-next-line no-unused-expressions
      val ? this.cmOptions.theme = 'eva-dark' : this.cmOptions.theme = 'eva';
      this.refresh();
    },
    code() {
      console.log('code update');
    },
  },
  mounted() {
    if (this.isDarkTheme) {
      this.cmOptions.theme = 'eva-dark';
    } else {
      this.cmOptions.theme = 'eva';
    }
    console.log('mounted');
  },
  methods: {
    formatRange() {
      try {
        if (this.code) {
          this.code = JSON.stringify(JSON.parse(this.code), null, 4);
        }
        this.refresh();
      } catch (error) {
        console.log('error test', error);
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
@import 'codemirror/theme/base16-dark'
@import ./../sass/codeHighlightEva
@import ./../sass/codeHighlightEvaDark

.CodeMirror
  border: 1px solid #eee
  height: auto

.textarea
  max-height: 420px
  overflow: auto

</style>
