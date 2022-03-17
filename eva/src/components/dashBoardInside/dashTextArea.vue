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
      if (screen.width < 1400) {
        rowsCount = 15;
      }
      if (screen.width > 1920) {
        rowsCount = 25;
      }
      return Math.floor((this.heightFrom - 200) / rowsCount);
    },
    height() {
      let otstup = 55;
      if (screen.width < 1600) {
        otstup = 45;
      }
      return `${this.heightFrom - otstup}px`;
    },
    searchBtn() {
      const options = this.$store.getters.getOptions({
        idDash: this.idDash,
        id: this.id,
      });
      return options.searchBtn;
    },
    textAreaValue() {
      return this.$store.getters.getTextArea({
        idDash: this.idDash,
        id: this.id,
      });
    },
  },
  watch: {
    textAreaValue(val) {
      this.textarea = val;
    },
  },
  mounted() {
    this.$emit('hideDS', this.id);
    this.textarea = this.$store.getters.getTextArea({
      idDash: this.idDash,
      id: this.id,
    });
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
      const tockens = this.$store.getters.getTockens(this.idDash);
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
    },
  },
};
</script>

<style lang="scss">
@import '../../sass/dashTextArea.sass';
</style>
