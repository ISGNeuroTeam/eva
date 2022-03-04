<template>
  <v-navigation-drawer
    v-model="paleteShow"
    fixed
    class="theme-setting"
    right
    hide-overlay
    :color="theme.$main_text"
    :style="{
      background: theme.$main_bg,
      borderTop: `2px solid ${theme.$main_border}`,
      borderBottom: `2px solid ${theme.$main_border}`,
      borderLeft: `2px solid ${theme.$main_border}`,
    }"
  >
    <div class="theme-btn">
      <v-btn
        :color="theme.$primary_button"
        class="theme-choise-btn"
        @click="setTheme('light')"
      >
        Светлая тема
      </v-btn>
      <v-btn
        :color="theme.$primary_button"
        class="theme-choise-btn"
        @click="setTheme('dark')"
      >
        Тёмная тема
      </v-btn>
    </div>
  </v-navigation-drawer>
</template>

<script>
export default {
  props: {
    paleteFrom: Boolean,
  },
  data() {
    return {
      paleteShow: false,
    };
  },
  computed: {
    theme() {
      return this.$store.getters.getTheme;
    },
  },
  watch: {
    paleteFrom(palete) {
      this.paleteShow = !!palete;
    },
  },
  methods: {
    setTheme(theme) {
      this.$store.commit('setTheme', theme);
      const settings = JSON.stringify({
        theme,
      });
      this.$store.commit('setThemeBack', JSON.stringify({ setting: settings }));
    },
  },
};
</script>

<style lang="scss">
@import '../sass/themeSettings.sass';
</style>
