<template>
  <div class="dash-textArea">
    <v-textarea
      v-model="textarea"
      :color="color.controls"
      outlined
      :style="{ color: color.text }"
      spellcheck="false"
      hide-details
      class="textarea-itself"
      :height="height"
      no-resize
      @keypress.enter="setTockenByPress($event)"
      @blur="setTockenBlur($event)"
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
</template>

<script>
import { mdiMagnify } from '@mdi/js';

export default {
  props: {
    // переменные полученные от родителя
    idFrom: null, // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда
    colorFrom: null, // цветовые переменные
    heightFrom: null, // выоста родительского компонента
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
      return Math.floor((this.heightFrom - 200) / rowsCount);
    },
    height() {
      const otstup = window.screen.width < 1600 ? 45 : 55;
      return `${this.heightFrom - otstup}px`;
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

      if (!this.dashFromStore.options.lastDot) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'lastDot',
          value: false,
        }]);
      }
      if (!this.dashFromStore.options.stringOX) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'stringOX',
          value: false,
        }]);
      }
      if (!this.dashFromStore?.options.united) {
        this.$store.commit('setState', [{
          object: this.dashFromStore.options,
          prop: 'united',
          value: false,
        }]);
      }

      return this.dashFromStore.options;
    },
    searchBtn() {
      const options = this.getOptions;
      return options.searchBtn;
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
  },
  watch: {
    textAreaValue(val) {
      this.textarea = val;
    },
  },
  mounted() {
    this.$emit('hideDS', this.id);
    this.textarea = this.getTextArea;
    this.$store.commit('setActions', {
      actions: this.actions,
      idDash: this.idDash,
      id: this.id,
    });
  },
  methods: {
    setTockenBlur(event) {
      event.preventDefault();
      this.$store.commit('setTextArea', {
        idDash: this.idDash,
        id: this.id,
        textarea: this.textarea,
      });
      this.setTocken();
    },
    acceptTextArea() {
      this.$store.commit('setTextArea', {
        idDash: this.idDash,
        id: this.id,
        textarea: this.textarea,
      });
      this.setTocken();
    },
    setTockenByPress(event) {
      event.preventDefault();
      this.setTocken();
    },
    setTocken() {
      const { tockens } = this.$store.state[this.idDash];
      if (tockens) {
        let name = '';
        Object.keys(tockens).forEach((i) => {
          if (tockens[i].elem === this.id && tockens[i].action === 'accept') {
            name = tockens[i].name;
          }
        });
        const textarea = this.textarea.replace(/\n/g, ' ');
        const tocken = {
          name,
          action: 'accept',
          capture: '',
        };

        this.$store.commit('setTocken', {
          tocken,
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
