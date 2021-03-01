<template>
  <div class="bush-wrapper">
    <div align="start">
      <v-icon :color="'white'">{{ icon.iconArrowAll }}</v-icon>
      <v-icon :color="'white'">{{ icon.iconArrowAll }}</v-icon>
    </div>
    <div class="bush-ygraph-container" :style="{ top: `${top}` }" ref="graph" />
  </div>
</template>


<script>
import * as yfile from "yfiles";
import licenseData from "./license.json";
import { mdiArrowAll } from "@mdi/js";
yfile.License.value = licenseData; //проверка лицензии

export default {
  name: "dashBush",
  props: {
    // переменные полученные от родителя
    idFrom: null, // id элемнета (table, graph-2)
    idDashFrom: null, // id дашборда
    dataRestFrom: null, // данные полученые после выполнения запроса
    colorFrom: null, // цветовые переменные
  },
  data() {
    return {
      icon: {
        iconArrowAll: mdiArrowAll,
      },
      coordX: {
        min: null,
        max: null,
        delta: null,
      },
      coordY: {
        min: null,
        max: null,
        delta: null,
      },
      propertiesBlock: false, //блок свойств
      elementBlock: false, //блок палитры элементов
      elementConfig: null, //конфиг палитры элементов
      nodesSource: null, //ноды
      edgesSource: null, //связи
    };
  },
  computed: {
    top() {
      // для ряда управляющих иконок
      if (document.body.clientWidth <= 1600) {
        return "50px";
      } else {
        return "60px";
      }
    },
    dragRes() {
      let dragRes = this.$store.getters.getDragRes({
        idDash: this.idDashFrom,
        id: this.idFrom,
      });
      if (dragRes === "true") {
        return true;
      } else {
        return false;
      }
    },
    containerWidth() {
      return  Math.floor(this.$refs.graph.clientWidth);
    },
    containerHeight() {
      return  Math.floor(this.$refs.graph.clientHeight);
    },
  },
  watch: {
    dataRestFrom(val) {
      this.mincoord(val);
      this.nullcoord(val);
      this.maxdeltacoord(val);
      this.generateNodesEdges(val);
      this.drawGraph();
      this.drawEdges()

    },
  },
  mounted() {
    this.createGraph();
  },
  methods: {
    mincoord(dataRest) {
      let _min = dataRest[0].object_coordinate_X**2+ dataRest[0].object_coordinate_Y**2
      let _minIndex = 0
      for(let i = 0; i < dataRest.length - 1; i++){
        let _tmpmin =  dataRest[i].object_coordinate_X**2+ dataRest[i].object_coordinate_Y**2
        if(_tmpmin<_min){
          _min=_tmpmin
          _minIndex = i
        }
      }
      this.coordX.min = dataRest[_minIndex].object_coordinate_X
      this.coordY.min = dataRest[_minIndex].object_coordinate_Y
    },
    nullcoord(dataRest) {
      //в последней строке доступы + JSON
      for (let i = 0; i < dataRest.length - 1; i++) {
        if (
          dataRest[i].object_coordinate_X - this.coordX.min >
            80 * dataRest.length ||
          dataRest[i].object_coordinate_Y - this.coordY.min >
            170 * dataRest.length
        ) {
          dataRest[i].object_coordinate_X = 0;
          dataRest[i].object_coordinate_Y = 0;
        }
      }
    },
    maxdeltacoord(dataRest) {
      //начальные значения для макс расстояний
      this.coordX.max = dataRest[0].object_coordinate_X;
      this.coordY.max = dataRest[0].object_coordinate_Y;

      for (let i = 0; i < dataRest.length - 1; i++) {
        if (dataRest[i].object_coordinate_X > this.coordX.max) {
          this.coordX.max = dataRest[i].object_coordinate_X;
        }

        if (dataRest[i].object_coordinate_Y > this.coordY.max) {
          this.coordY.max = dataRest[i].object_coordinate_Y;
        }
      }

      this.coordX.delta = Number(this.coordX.max) - Number(this.coordX.min);
      this.coordY.delta = Number(this.coordY.max) - Number(this.coordY.min);
    },

    drawGraph() {
      this.$graphComponent.graph.clear();
      //обнулили переменную за ноды на графе
      this.$graphNodes = null
      const _alpha =Math.acos(this.containerWidth/Math.sqrt(this.containerWidth**2+this.containerHeight**2))
      
      this.nodesSource.forEach((node) => {
        const _xc = node.point.x - this.containerWidth/2
        const _yc = node.point.y - this.containerHeight/2

        const _alphac = Math.acos(_xc/Math.sqrt(_xc**2+_yc**2))

        let _xn = null
        let _yn = null 
        if (_alphac>=Math.PI/2){
          _xn = Math.sqrt(_xc**2+_yc**2)*Math.cos(_alpha+ _alphac)
          _yn = Math.sqrt(_xc**2+_yc**2)*Math.sin(_alpha+ _alphac)
        } else{
          _xn = Math.sqrt(_xc**2+_yc**2)*Math.cos(_alpha-_alphac)
          _yn = Math.sqrt(_xc**2+_yc**2)*Math.sin(_alpha- _alphac)
        }
        

        const _x = _xn+this.containerWidth/2
        const _y = _yn+ this.containerHeight/2
        //Нода которую рисуем
        const _node = this.$graphComponent.graph.createNodeAt([
          _x,
          _y,
        ]);
        //для связи по надам
        _node.tag = node.id

        if(this.$graphNodes){
          this.$graphNodes.push(_node)
        }else{
          this.$graphNodes = []
          this.$graphNodes.push(_node)
        }
        //label для ноды
        this.$graphComponent.graph.addLabel(_node, node.label)
      });
    },
    drawEdges(){
      console.log(this.$graphNodes)
    },
    generateNodesEdges(dataRest) {
      let _allNodes = [];
      let _allEdges = [];
      const _kX = this.containerWidth / this.coordX.delta;
      const _kY = this.containerHeight / this.coordY.delta;
      //в последней строке доступы
      for (let i = 0; i < dataRest.length - 1; i++) {
        _allNodes.push({
          id: Number(dataRest[i].ID),
          point: new yfile.Point(
            dataRest[i].object_coordinate_X > 0
              ? (Number(dataRest[i].object_coordinate_X) -
                Number(this.coordX.min))*_kX
              : dataRest[i].object_coordinate_X,

            dataRest[i].object_coordinate_Y > 0
              ? (Number(dataRest[i].object_coordinate_Y) -
                Number(this.coordY.min))*_kY
              : dataRest[i].object_coordinate_Y
          ),
          label: dataRest[i].object_label,
          type: dataRest[i].object,
          status: dataRest[i].status,
        });

        if (dataRest[i].edges) {
          dataRest[i].edges.split(",").forEach((edge) => {
            _allEdges.push({
              fromNode: Number(dataRest[i].ID),
              toNode: Number(edge),
            });
          });
        }
      }
      this.nodesSource = _allNodes;
      this.edgesSource = _allEdges;
    },

    createGraph() {
      this.$graphComponent = new yfile.GraphComponent(this.$refs.graph);
      this.$graphComponent.inputMode = new yfile.GraphEditorInputMode();

      this.initializeDefaultStyles();
    },
    initializeDefaultStyles() {
      this.$graphComponent.graph.nodeDefaults.style = new yfile.ShapeNodeStyle({
        fill: "orange",
        stroke: "orange",
        shape: "rectangle",
      });
    },
  },
};
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