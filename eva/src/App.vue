<template>
  <div :style="cssVariables">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  computed: {
    cssVariables() {
      let currentTheme = this.$store.getters.getTheme
      return {
        '--main_bg': currentTheme.$main_bg,
        '--secondary_bg': currentTheme.$secondary_bg,
        '--secondary_border': currentTheme.$secondary_border,
        '--main_border': currentTheme.$main_border,
        '--secondary_text': currentTheme.$secondary_text,
        '--main_text': currentTheme.$main_text,
        '--title': currentTheme.$title,
        '--primary_button': currentTheme.$primary_button,
        '--primary_button_hover': currentTheme.$primary_button_hover,
        '--accent_ui_color': currentTheme.$accent_ui_color,
        '--ok_color': currentTheme.$ok_color,
        '--wrong_color': currentTheme.$wrong_color,
        '--error_color': currentTheme.$error_color,
        '--grass': currentTheme.$grass,
        '--forest': currentTheme.$forest,
        '--blue': currentTheme.$blue,
        '--plum': currentTheme.$plum,
        '--purple': currentTheme.$purple,
        '--orange': currentTheme.$orange,
        '--peach': currentTheme.$peach,
        '--raspberry': currentTheme.$raspberry,
        '--coral': currentTheme.$coral,
        '--beet': currentTheme.$beet,
        '--sun': currentTheme.$sun,
        '--kiwi': currentTheme.$kiwi,
        '--sea': currentTheme.$sea,
      }
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>