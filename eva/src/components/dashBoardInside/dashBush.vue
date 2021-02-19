<template>
  <div class="bush-wrapper">
    <div class="bush-ygraph-container" :style="{top:`${top}`}" ref="graph"/>
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
    this.$graphComponent = new yfile.GraphComponent(this.$refs.graph)
    this.$graphComponent.inputMode = new yfile.GraphViewerInputMode()
    this.initializeDefaultStyles()
    this.createDefaultGraph()
  },
  methods: {
    initializeDefaultStyles() {
      this.$graphComponent.graph.nodeDefaults.style = new yfile.ShapeNodeStyle({
        fill: 'orange',
        stroke: 'orange',
        shape: 'rectangle'
      })
    },
    createDefaultGraph() {
      const graph = this.$graphComponent.graph
      graph.clear()

      const n1 = graph.createNode()
      const n2 = graph.createNodeAt([250, 150])
      const n3 = graph.createNodeAt([150, 250])
      graph.createEdge(n1, n2)
      graph.createEdge(n1, n3)
      graph.createEdge(n2, n3)
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