<template>
  <div :style="cssVariables">
    <router-view :key="$route.fullPath" />
  </div>
</template>

<script>
import Vue from 'vue';

export default {
  name: 'App',
  data() {
    return {
      startDocumentTitle: null,
    };
  },
  computed: {
    cssBodyVariables() {
      const currentTheme = this.$store.getters.getTheme;
      return [
        `--scroll_bg: ${currentTheme.$main_bg}`,
        `--scroll_thumb: ${currentTheme.$secondary_text}`,
      ].join(';');
    },
    cssVariables() {
      const currentTheme = this.$store.getters.getTheme;
      const styleObject = {};
      Object.keys(currentTheme).forEach((key) => {
        styleObject[key.replace('$', '--')] = currentTheme[key];
        if (key !== '$background_image') {
          styleObject[`${key.replace('$', '--')}-rgb`] = this.hexToRGB(
            currentTheme[key],
          );
        }
      });
      return styleObject;
    },
  },
  watch: {
    cssBodyVariables(val) {
      document.body.style = val;
    },
  },
  mounted() {
    this.startDocumentTitle = document.title;
    this.$root.$on('setDocumentTitle', (text) => {
      const { startDocumentTitle } = this;
      document.title = text ? `${startDocumentTitle} | ${text}` : startDocumentTitle;
    });
    document.body.style = this.cssBodyVariables;
    // TODO: временный костыль
    // Синхронизация логаута на всех вкладках браузера
    window.onload = () => {
      window.onstorage = () => {
        if (!document.cookie.includes('eva_token') && (this.$route.fullPath !== '/')) {
          window.location.reload();
        }
      };
    };
    if (Vue.$jwt.decode()) {
      this.$store.dispatch('settingApp');
    }
  },
  methods: {
    hexToRGB(h) {
      let r = 0;
      let g = 0;
      let b = 0;

      // 3 digits
      if (h.length === 4) {
        r = `0x${h[1]}${h[1]}`;
        g = `0x${h[2]}${h[2]}`;
        b = `0x${h[3]}${h[3]}`;

        // 6 digits
      } else if (h.length === 7) {
        r = `0x${h[1]}${h[2]}`;
        g = `0x${h[3]}${h[4]}`;
        b = `0x${h[5]}${h[6]}`;
      }

      return `${+r},${+g},${+b}`;
    },
  },
};
</script>

<style>
@import '../node_modules/yfiles/yfiles.css';
</style>
