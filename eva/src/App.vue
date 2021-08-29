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
        styleObject[key.replace('$','--') + '-rgb'] = this.hexToRGB(currentTheme[key]);
      })
      return styleObject;
    }
  },
  methods: {
    hexToRGB(h) {
      let r = 0, g = 0, b = 0;

      // 3 digits
      if (h.length === 4) {
        r = "0x" + h[1] + h[1];
        g = "0x" + h[2] + h[2];
        b = "0x" + h[3] + h[3];

        // 6 digits
      } else if (h.length === 7) {
        r = "0x" + h[1] + h[2];
        g = "0x" + h[3] + h[4];
        b = "0x" + h[5] + h[6];
      }

      return +r + "," + +g + "," + +b ;
    }
  }
}
</script>

<style scoped>

</style>