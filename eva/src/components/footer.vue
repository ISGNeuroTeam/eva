<template>
  <div 
    class="footer-block" 
    :style="{color: color.text}"
  >
    {{ version }}
  </div>    
</template>


<script>

import themes from '../js/themeSettings.js';

export default {

  data () {
    return {
      version: '1.51.0 20200818-113800',
      color: { },
    } 
  },
  computed: { 

    theme: function() {
      return this.$store.getters.getTheme
    }
  },  
  watch: {
    theme: function (theme) {
      this.color = themes[theme];
      
    },
  },  
  methods: {

  },
  mounted() {
    this.color = themes[this.theme];
  }
}


</script>

<style lang="sass" > 
  
   @import '../sass/footer.sass'

   
</style>