<template>
  <v-navigation-drawer
    v-model="paleteShow"
    fixed
    class="theme-setting"
    right
    hide-overlay
    :color="theme.$main_text"
    :style="{background: theme.$main_bg,
            borderTop:`2px solid ${theme.$main_border}`,
            borderBottom:`2px solid ${theme.$main_border}`,
            borderLeft:`2px solid ${theme.$main_border}`}"
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
// import {  mdiChevronDown, mdiChevronUp } from '@mdi/js'
export default {
  props: {
    paleteFrom: Boolean,
  },
  data () {
    return {
      paleteShow: false,
      // switchers: {
      //   textBlock: {
      //     status: false,
      //     arrow: mdiChevronDown
      //   },
      //   backBlock: {
      //     status: false,
      //     arrow: mdiChevronDown
      //   },
      //   controlsBlock: {
      //     status: false,
      //     arrow: mdiChevronDown
      //   },
      //   controlsActiveBlock: {
      //     status: false,
      //     arrow: mdiChevronDown
      //   },
      //   borderBlock: {
      //     status: false,
      //     arrow: mdiChevronDown
      //   },
      //   backElementBlock: {
      //     status: false,
      //     arrow: mdiChevronDown
      //   }
      // }
    } 
  },
  computed: {
    // active: function() {
    //   return this.showFrom
    // },
    theme: function() {
      return this.$store.getters.getTheme
    }
  },  
  watch: {
    paleteFrom: function (palete) {
      palete ? this.paleteShow = true : this.paleteShow = false;

    },
  },
  methods: {
    // switchBlock: function(switcher) {
    //   Object.keys(this.switchers).forEach( item => {
    //     if (item != switcher) {
    //       this.switchers[item].status = false;
    //       this.switchers[item].arrow = mdiChevronDown;
    //     }
    //   })
    //   this.switchers[switcher].status = !this.switchers[switcher].status;
    //   if (this.switchers[switcher].status) {
    //     this.switchers[switcher].arrow = mdiChevronUp;
    //   } else {
    //     this.switchers[switcher].arrow = mdiChevronDown;
    //   }
    // },
    setTheme: function(theme){
      this.$store.commit('setTheme', theme);
      let settings = JSON.stringify({
        theme: theme,
      });
      this.$store.commit('setThemeBack', JSON.stringify({setting: settings}));
    },
  },
}


</script>

<style lang="scss" > 
  
    @import '../sass/themeSettings.sass'

   
</style>