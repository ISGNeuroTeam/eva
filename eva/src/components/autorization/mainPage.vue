<template>
  <v-app 
    class="aut-app-main" 
    :style="{backgroundColor:theme.$secondary_bg}"
  >
    <header-top :inside="false" />
    <v-content>
      <v-container class="main-container container-product">
        <div class="product-block">
          <v-card 
            class="product-block-itself" 
            :style="{backgroundColor:theme.$main_bg}"
            @click="openDash"  
          >   
            <v-card-text 
              class="product-text" 
              :style="{color:theme.$title}"
            >
              Конструирование <br> дашбордов
              <p 
                class="delimetr" 
                :style="{backgroundColor:theme.$title}"
              />
            </v-card-text>
          </v-card>
          <v-card  
            class="product-block-itself" 
            :style="{backgroundColor:theme.$main_bg}"
            @click="openReport"
          >   
            <v-card-text 
              class="product-text" 
              :style="{color:theme.$title}"
            >
              Исследование <br> данных
              <p 
                class="delimetr" 
                :style="{backgroundColor:theme.$title}"
              />
            </v-card-text>
          </v-card>
          <v-card
              class="product-block-itself"
              :style="{backgroundColor:theme.$main_bg}"
              @click="openDataResearch"
          >
            <v-card-text
                class="product-text"
                :style="{color:theme.$title}"
            >
              Исследование <br> данных 2.0
              <p
                  class="delimetr"
                  :style="{backgroundColor:theme.$title}"
              />
            </v-card-text>
          </v-card>
          <v-card  
            class="product-block-itself" 
            :style="{backgroundColor:theme.$main_bg}"
            @click="openQuis"
          >   
            <v-card-text 
              class="product-text" 
              :style="{color:theme.$title}"
            >
              Вопрос  <br>  ответ
              <p 
                class="delimetr" 
                :style="{backgroundColor:theme.$title}"
              />
            </v-card-text>
          </v-card>
          <v-card  
            class="product-block-itself" 
            :style="{backgroundColor:theme.$main_bg}"
            @click="openPaper"
          >   
            <v-card-text 
              class="product-text" 
              :style="{color:theme.$title}"
            >
              Конструирование  <br>  отчетов
              <p 
                class="delimetr" 
                :style="{backgroundColor:theme.$title}"
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


export default {

  data () {
    return {
    } 
  },
  computed: {
    theme: function() {
      return this.$store.getters.getTheme
    }
  },
  methods: {
    openDash: function() {
      this.$router.push(`/dashboards`); 
    },
    openReport: function() {
      this.$store.commit('createReportSearch'); 
      this.$router.push(`/reports`); 
    },
    openDataResearch: function() {
      this.$router.push(`/data-research`);
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
  }
}


</script>

<style lang="scss" > 
  
   @import '../../sass/mainPage.sass'

   
</style>