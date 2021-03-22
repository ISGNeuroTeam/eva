<template>
  <div class="dash-template">
      morozov
  </div>
</template>


<script>
import L from "leaflet";

export default {
  props: {
    // переменные полученные от родителя
    idFrom: null, // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null, // цветовые переменные
    shouldFrom: null, // меняется в момент выбора источника данных у дашборда
    widthFrom: null, // ширина родительского компонента
    heightFrom: null, // выоста родительского компонента
  },
  data() {
    return {
      osmserver: null,
      error: null,
      library: null
    };
  },
  computed: {
  },
  watch: {
    dataRestFrom(_dataRest) {
      //получаем osm server
      this.error = null
      this.osmserver = this.getOSM()

      //получаем библиотеку
      this.generateLibrary(_dataRest)
    }
  },
  methods: {
    getOSM() {
      let options = this.$store.getters.getOptions({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      if(options.osmserver){
        return options.osmserver
      } else {
        this.error = "Введите osm server"
      }
    },
    generateLibrary(dataRest) {
      const _tmp = dataRest[dataRest.length - 1].ID.replaceAll("'", '"');
      try {
        this.library = JSON.parse(_tmp);
      } catch {
        this.error = "Ошибка формата входных данных";
      }
    },
  },
  mounted() {
  },
};
</script>