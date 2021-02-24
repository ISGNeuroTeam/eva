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
      },
      coordY: {
        min: null,
        max: null,
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
  },
  watch: {
    dataRestFrom(val) {
      this.minmaxcoord(val);
      this.generateNodesEdgesConfig(val);
    },
  },
  mounted() {
    this.createGraph();
  },
  methods: {
    minmaxcoord(dataRest) {
      //начальные значения для мин и макс расстояний
      this.coordX.min = dataRest[0].object_coordinate_X;
      this.coordX.max = dataRest[0].object_coordinate_X;
      this.coordY.min = dataRest[0].object_coordinate_Y;
      this.coordY.max = dataRest[0].object_coordinate_Y;

      for (let i = 0; i < dataRest.length - 1; i++) {
        if (dataRest[i].object_coordinate_X > this.coordX.max) {
          this.coordX.max = dataRest[i].object_coordinate_X;
        }
        if (dataRest[i].object_coordinate_X < this.coordX.min) {
          this.coordX.min = dataRest[i].object_coordinate_X;
        }

        if(dataRest[i].object_coordinate_Y > this.coordY.max){
          this.coordY.max = dataRest[i].object_coordinate_Y;
        }
        if (dataRest[i].object_coordinate_Y < this.coordY.min) {
          this.coordY.min = dataRest[i].object_coordinate_Y;
        }
      }
    },

    generateNodesEdgesConfig(dataRest) {
      let _allNodes = [];
      let _allEdges = [];
      //в последней строке доступы
      for (let i = 0; i < dataRest.length - 1; i++) {
        _allNodes.push({
          id: dataRest[i].ID,
          point: new yfile.Point(
            dataRest[i].object_coordinate_X,
            dataRest[i].object_coordinate_Y
          ),
          label: dataRest[i].object_label,
          type: dataRest[i].object,
          status: dataRest[i].status,
        });
        if (dataRest[i].edges) {
          dataRest[i].edges.split(",").forEach((edge) => {
            _allEdges.push({
              fromNode: dataRest[i].ID,
              toNode: Number(edge),
            });
          });
        }
      }
      this.nodesSource = _allNodes;
      this.edgesSource = _allEdges;
      //конфиг в элементе
      this.elementConfig = JSON.parse(
        dataRest[dataRest.length - 1].ID.replaceAll("'", '"')
      );
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