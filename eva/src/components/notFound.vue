<template>
  <v-app>
    <v-main class="full-page align-center">
      <div class="text-center">
        <h2 class="display-1">
          Страница не найдена
        </h2>
        <div class="mt-4">
          <v-btn
            to="/main"
            outlined
            :dark="isDarkTheme"
          >
            На главную
          </v-btn>
        </div>
      </div>
    </v-main>
  </v-app>
</template>

<script>
export default {
  computed: {
    isDarkTheme() {
      return this.$store.getters.getThemeTitle.indexOf('light') === -1;
    },
  },
};
</script>

<style scoped lang="sass">
.full-page
  background: var(--secondary_bg)
  color: var(--main_text)
</style>
