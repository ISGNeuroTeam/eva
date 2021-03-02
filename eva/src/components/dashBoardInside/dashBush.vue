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
      nodesSource: null, //ноды
      edgesSource: null, //связи
      nodesCoords: null, // подготовленные ноды
      Kproportion: null,
      Xmin: null,
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
      return Math.floor(this.$refs.graph.clientWidth);
    },
    containerHeight() {
      return Math.floor(this.$refs.graph.clientHeight);
    },
    elementConfig() {
      if (this.dataRestFrom) {
        return JSON.parse(
          this.dataRestFrom[this.dataRestFrom.length - 1].ID.replaceAll(
            "'",
            '"'
          )
        );
      } else {
        return null;
      }
    },
  },
  watch: {
    dataRestFrom(val) {
      //генерируем и рисуем ноды
      this.mincoord(val);
      this.nullcoord(val);
      this.maxdeltacoord(val);
      this.generateNodes(val);
      this.accumulationCoords();
      this.generateKproportion();
      this.drawNodes();
      //генерируем связи
      this.generateEdges(val);
      //this.drawEdges()
    },
  },
  mounted() {
    this.createGraph();
  },
  methods: {
    mincoord(dataRest) {
      let _min =
        dataRest[0].object_coordinate_X ** 2 +
        dataRest[0].object_coordinate_Y ** 2;
      let _minIndex = 0;
      for (let i = 0; i < dataRest.length - 1; i++) {
        let _tmpmin =
          dataRest[i].object_coordinate_X ** 2 +
          dataRest[i].object_coordinate_Y ** 2;
        if (_tmpmin < _min) {
          _min = _tmpmin;
          _minIndex = i;
        }
      }
      this.coordX.min = dataRest[_minIndex].object_coordinate_X;
      this.coordY.min = dataRest[_minIndex].object_coordinate_Y;
    },
    nullcoord(dataRest) {
      //в последней строке доступы + JSON
      for (let i = 0; i < dataRest.length - 1; i++) {
        if (
          dataRest[i].object_coordinate_X - this.coordX.min >
            this.elementConfig.extra.max_X * dataRest.length ||
          dataRest[i].object_coordinate_Y - this.coordY.min >
            this.elementConfig.extra.max_Y * dataRest.length
        ) {
          dataRest[i].object_coordinate_X =
            dataRest[i].object_coordinate_X -
            Math.trunc(dataRest[i].object_coordinate_X);
          dataRest[i].object_coordinate_Y =
            dataRest[i].object_coordinate_Y -
            Math.trunc(dataRest[i].object_coordinate_Y);
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

    accumulationCoords() {
      this.$graphComponent.graph.clear();
      this.nodesCoords = null;
      const _alpha = Math.acos(
        this.containerWidth /
          Math.sqrt(this.containerWidth ** 2 + this.containerHeight ** 2)
      );

      this.nodesSource.forEach((node) => {
        const _xc = node.point.x - this.containerWidth / 2;
        const _yc = node.point.y - this.containerHeight / 2;

        const _alphac = Math.acos(_xc / Math.sqrt(_xc ** 2 + _yc ** 2));

        let _xn = null;
        let _yn = null;
        if (_alphac >= Math.PI / 2) {
          _xn = Math.sqrt(_xc ** 2 + _yc ** 2) * Math.cos(_alpha + _alphac);
          _yn = Math.sqrt(_xc ** 2 + _yc ** 2) * Math.sin(_alpha + _alphac);
        } else {
          _xn = Math.sqrt(_xc ** 2 + _yc ** 2) * Math.cos(_alpha - _alphac);
          _yn = Math.sqrt(_xc ** 2 + _yc ** 2) * Math.sin(_alpha - _alphac);
        }

        const _x = _xn + this.containerWidth / 2;
        const _y = _yn + this.containerHeight / 2;

        if (this.nodesCoords) {
          this.nodesCoords.push({ x: _x, y: _y });
        } else {
          this.nodesCoords = [];
          this.nodesCoords.push({ x: _x, y: _y });
        }
      });
    },
    generateKproportion() {
      this.Xmin = this.nodesCoords[0].x;
      let Xmax = this.nodesCoords[0].x;
      this.nodesCoords.forEach((node) => {
        if (node.x > Xmax) {
          Xmax = node.x;
        }
        if (node.x < this.Xmin) {
          this.Xmin = node.x;
        }
      });
      this.Kproportion = (Xmax - this.Xmin) / this.containerWidth;
    },
    drawNodes() {
      this.nodesCoords.forEach((node) => {
        this.$graphComponent.graph.createNodeAt([
          (-1 * this.Xmin + node.x) / this.Kproportion,
          node.y / this.Kproportion,
        ]);
      });
    },
    drawEdges() {
      this.edgesSource.forEach((edge) => {
        let _fNode = null;
        let _tNode = null;
        this.$graphNodes.forEach((gNode) => {
          if (gNode.tag === edge.fromNode) {
            _fNode = gNode;
          }
          if (gNode.tag === edge.toNode) {
            _tNode = gNode;
          }
        });
        this.$graphComponent.graph.createEdge(_fNode, _tNode);
      });
    },
    generateEdges(dataRest) {
      let _allEdges = [];
      //в последней строке доступы
      for (let i = 0; i < dataRest.length - 1; i++) {
        if (dataRest[i].edges) {
          const _tmpEdge = JSON.parse(dataRest[i].edges.replaceAll("'", '"'));
          Object.keys(_tmpEdge).forEach((key) => {
            //прохожу по всем ключам
            _tmpEdge[key].forEach((edge) => {
              _allEdges.push({
                fromNode: Number(dataRest[i].ID),
                toNode: Number(edge),
                style: key // стиль 
              });
            });
          });
        }
      }
      this.edgesSource = _allEdges
    },
    generateNodes(dataRest) {
      let _allNodes = [];
      const _kX = this.containerWidth / this.coordX.delta;
      const _kY = this.containerHeight / this.coordY.delta;
      //в последней строке доступы
      for (let i = 0; i < dataRest.length - 1; i++) {
        _allNodes.push({
          id: Number(dataRest[i].ID),
          point: new yfile.Point(
            dataRest[i].object_coordinate_X >= 1
              ? (Number(dataRest[i].object_coordinate_X) -
                  Number(this.coordX.min)) *
                _kX
              : dataRest[i].object_coordinate_X * this.containerWidth,

            dataRest[i].object_coordinate_Y >= 1
              ? (Number(dataRest[i].object_coordinate_Y) -
                  Number(this.coordY.min)) *
                _kY
              : dataRest[i].object_coordinate_Y * this.containerHeight
          ),
          label: dataRest[i].object_label,
          type: dataRest[i].object,
          status: dataRest[i].status,
        });
      }
      this.nodesSource = _allNodes;
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