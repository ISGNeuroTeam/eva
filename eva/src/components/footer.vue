<template>
  <div 
    class="footer-block" 
    :style="{color: theme.$main_text}"
  >
    {{ version }}
  </div>    
</template>


<script>
export default {
  data () {
    return {
      version: '1.57.1',
    } 
  },
  computed: {
    theme: function() {
      return this.$store.getters.getTheme
    }
  },
}
</script>

<style lang="sass" > 
  
   @import '../sass/footer.sass'

   
</style>