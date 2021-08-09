<template>
  <div :style="cssVariables" >
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
  computed: {
    cssVariables() {
      let currentTheme = this.$store.getters.getTheme;
      let styleObject = {};
      Object.keys(currentTheme).forEach(key => {
        styleObject[key.replace('$','--')] = currentTheme[key];
      })
      return styleObject;
    }
  },
}
</script>

<style scoped>

</style>