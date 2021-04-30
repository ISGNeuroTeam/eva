<template>
  <v-app 
    class="aut-app-main" 
    :style="{backgroundColor:color.back}"
  >
    <header-top :inside="false" />
    <v-content>
      <v-container class="main-container container-product">
        <div class="product-block">
          <v-card 
            class="product-block-itself" 
            :style="{backgroundColor:color.backElement}"
            @click="openDash"  
          >   
            <v-card-text 
              class="product-text" 
              :style="{color:color.text}" 
            >
              Конструирование <br> дашбордов
              <p 
                class="delimetr" 
                :style="{backgroundColor:color.text}"
              />
            </v-card-text>
          </v-card>
          <v-card  
            class="product-block-itself" 
            :style="{backgroundColor:color.backElement}"
            @click="openReport"
          >   
            <v-card-text 
              class="product-text" 
              :style="{color:color.text}"
            >
              Исследование <br> данных
              <p 
                class="delimetr" 
                :style="{backgroundColor:color.text}"
              />
            </v-card-text>
          </v-card>
          <v-card  
            class="product-block-itself" 
            :style="{backgroundColor:color.backElement}"
            @click="openQuis"
          >   
            <v-card-text 
              class="product-text" 
              :style="{color:color.text}"
            >
              Вопрос  <br>  ответ
              <p 
                class="delimetr" 
                :style="{backgroundColor:color.text}"
              />
            </v-card-text>
          </v-card>
          <v-card  
            class="product-block-itself" 
            :style="{backgroundColor:color.backElement}"
            @click="openPaper"
          >   
            <v-card-text 
              class="product-text" 
              :style="{color:color.text}"
            >
              Конструирование  <br>  отчетов
              <p 
                class="delimetr" 
                :style="{backgroundColor:color.text}"
              />
            </v-card-text>
          </v-card>
        </div>
      </v-container> 
    </v-content>
    <footer-bottom />
  </v-app>
</template>


<script>

import themes from '../../js/themeSettings.js';

export default {

  data () {
    return {
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
    openDash: function() {
      this.$router.push(`/dashboards`); 
    },
    openReport: function() {
      this.$store.commit('createReportSearch'); 
      this.$router.push(`/reports`); 
    },
    openPaper: function() {
      this.$store.commit('createPaperSearch'); 
      this.$router.push(`/papers`); 
    },
    openQuis: function() {
      //this.$router.push(`/quiz/list`);
      window.location.href = `/quiz/list`;  // используем window.location.href потому что /quiz/list внешняя ссылка а не часть приложения
    },
  },
  mounted() {
    document.title="EVA"
    this.color = themes[this.theme];
  }
}


</script>

<style lang="sass" > 
  
   @import '../../sass/mainPage.sass'

   
</style>