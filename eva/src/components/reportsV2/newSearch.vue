<template>
  <div
      class="search-block"
      :style="{background: theme.$main_bg, color: theme.$main_text}"
  >
    <div
        class="search-card-block"
        :style="{background: theme.$main_bg, color: theme.$main_text}"
    >
      <div
          class="loading-divider"
          :class="{loading:loading}"
      >
        <div
            class="loading-bar "
            :style="{background: theme.$primary_button}"
        />
      </div>
      <div class="search-block-header">
        <div 
            class="search-block-title"
            :style="{color: theme.$title}"
        >
          Новый поиск
        </div>
        <v-btn text @click="refreshInput">
          <span class="refresh-btn-text" :style="{color: theme.$main_text}">
            Сбросить
          </span> 
          <v-icon :style="{color: theme.$main_text}">{{ mdiRefresh }}</v-icon>
        </v-btn>
      </div>
      <v-textarea
          ref="search"
          v-model="search.original_otl"
          placeholder="Введите запрос"
          spellcheck="false"
          auto-grow
          filled
          outlined
          rows="1"
          row-height="15"
          @keyup.ctrl.\="addLineBreaks"
      ></v-textarea>
      <div class="search-block-footer">
        <div
            class="search-block-title"
            :style="{color: theme.$title}"
        >
        </div>
        <v-btn dark depressed small :color="theme.$ok_color" @click="launchSearch">
          <span class="refresh-btn-text">Поиск</span>
          <v-icon>{{ mdiMagnify }}</v-icon>
        </v-btn>
      </div>
    </div>
  </div>
</template>


<script>
import { mdiRefresh, mdiMagnify } from '@mdi/js'

export default {

  data () {
    return {
      search: {},
      mdiRefresh: mdiRefresh,
      mdiMagnify: mdiMagnify,
    }
  },
  computed: {
    theme: function() {
      return this.$store.getters.getTheme
    },
  },
  methods: {
    addLineBreaks(event) {
      this.search.original_otl = this.search.original_otl.replaceAll('|', '\n' + '|')
      if (this.search.original_otl[0] === '\n') {
        this.search.original_otl = this.search.original_otl.substring(1)
      }
      this.search.original_otl = this.search.original_otl.replaceAll("\n\n" + '|', '\n' + '|')
      this.search.original_otl = this.search.original_otl.replaceAll('|' + '\n', '| ')
      this.search.original_otl = this.search.original_otl.replaceAll('| ' + '\n', '| ')
    },
    refreshInput () {
      this.search.original_otl = ''
    },
    launchSearch: async function() {
      this.$emit("launchSearch", this.search.original_otl);
      
      // this.search.sid = this.hashCode(this.search.original_otl);
      //
      // this.$store.auth.getters.putLog(`Запущен запрос  ${this.search.sid}`);
      //
      // this.loading = true;
      // console.log('launch search')
      // let response = await this.$store.getters.getDataApi({search: this.search, idDash: 'reports'});
      // // вызывая метод в хранилище  
      // // console.log(response)
      //
      // if (!response.data || response.data.length == 0) {  // если что-то пошло не так 
      //   this.loading = false;
      //   this.$store.commit('setErrorLogs',true);
      //   this.data = [];
      //   this.rows = [];
      // } else {  // если все нормально
      //   console.log('data ready')
      //
      //   let responseDB = this.$store.getters.putIntoDB(response, this.search.sid, 'reports');
      //   responseDB
      //       .then(
      //           result => {
      //             let refresh =  this.$store.getters.refreshElements('reports', this.search.sid, );
      //             this.loading = false;
      //             this.$store.commit('setReportSearch',this.search);
      //           },
      //       );
      // }
    },
    hashCode: function(otl) {
      return otl.split('').reduce((prevHash, currVal) =>
          (((prevHash << 5) - prevHash) + currVal.charCodeAt(0))|0, 0);
    },
  },
  mounted() {
    document.title="EVA | Исследование данных"
    this.search = this.$store.getters.getReportSearch;
    if (this.search.original_otl != '') {
      this.$store.commit('setShould', { idDash: 'reports',  id: 'table', status: true});
    }
    // this.calcSize();
    this.$refs.search.$el.addEventListener ("keypress", event =>{
      if (event.ctrlKey && event.keyCode == 13) {
        this.launchSearch();
      }
    });
    this.$refs.report.addEventListener('click', event => {
      if(!event.target.classList.contains('static-row')) {
        this.showStatistic = false;
      }
    })
    this.unitedData.color=  this.theme.controls;
  }
}


</script>

<style lang="scss" >

//@import '../../sass/reportsV2/newSearch.sass'


</style>