<template>
  <div 
    class="footer-block" 
    :style="{color: theme.$main_text}"
  >
    {{ appVersion }}
  </div>    
</template>


<script>
import {version} from './../../package.json'
export default {
  data () {
    return {
      appVersion: version,
    } 
  },
  computed: {
    theme: function() {
      return this.$store.getters.getTheme
    }
  },
}
</script>

<style lang="scss" > 
  
   @import '../sass/footer.sass'

   
</style>