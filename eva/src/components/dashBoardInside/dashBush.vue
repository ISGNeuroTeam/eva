<template>
  <div class="bush-wrapper">
    <div align="start">
      <v-icon :color="'white'">{{icon.iconArrowAll}}</v-icon>
      <v-icon :color="'white'">{{icon.iconArrowAll}}</v-icon>
    </div>
    <div class="bush-ygraph-container" :style="{top:`${top}`}" ref="graph"/>
  </div>
</template>


<script>
import * as yfile from 'yfiles'
import licenseData from './license.json'
import { mdiArrowAll } from '@mdi/js'
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
      icon: {
        iconArrowAll: mdiArrowAll,
      },
      propertiesBlock: false, //блок свойств
      elementBlock: false, //блок палитры элементов
      elementConfig: null, //конфиг палитры элементов
      nodesSource: null, //ноды
      edgesSource: null, //связи
    } 
  },
  computed: {
    top () {// для ряда управляющих иконок 
      if(document.body.clientWidth <=1600){
        return '50px'
      } else {
        return '60px'
      }
    },
    dragRes () {
      let dragRes = this.$store.getters.getDragRes({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      if(dragRes === 'true'){
        return true
      } else {
        return false
      }
    },
  },
  watch: {
    dataRestFrom() {
    },
  },
  mounted() {
    this.createGraph()
  },
  methods: {
    initializeDefaultStyles() {
      this.$graphComponent.graph.nodeDefaults.style = new yfile.ShapeNodeStyle({
        fill: 'orange',
        stroke: 'orange',
        shape: 'rectangle'
      })
    },
    createGraph() {
      this.$graphComponent = new yfile.GraphComponent(this.$refs.graph)
      this.$graphComponent.inputMode = new yfile.GraphEditorInputMode()

      this.initializeDefaultStyles()
    },
  }
}


</script>

<style scoped>

.bush-ygraph-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 50px;
}
</style>