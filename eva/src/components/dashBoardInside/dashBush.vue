<template>
  <div class="bush-wrapper">
    <div class="bush-ygraph-container" ref="graph"/>
  </div>
</template>


<script>
import * as yfile from 'yfiles'
import licenseData from './license.json'
yfile.License.value = licenseData//проверка лицензии

export default {
  name: "dashBush",
  props: {  // переменные полученные от родителя
    idFrom: null,  // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда 
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null,  // цветовые переменные
  },
  data () {
    return {
    } 
  },
  watch: {
    dataRestFrom() {
    },
  },
  mounted() {
  }, 
  methods: {
  },

}


</script>

<style lang="css" > 
.bush-ygraph-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
}

   
</style>