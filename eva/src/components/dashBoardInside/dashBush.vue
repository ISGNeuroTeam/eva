<template>
  <div class="bush-wrapper">
    <div class="bush-ygraph-container" :style="{ top: `${top}` }" ref="graph" />
  </div>
</template>


<script>
import * as yfile from "yfiles";
import licenseData from "./license.json";
import NodeStyleDecorator from "./NodeStyleDecorator.js";

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
      nodesSource: null, //ноды
      edgesSource: null, //связи
      maxWidthLibrary: 30,
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
      return Math.floor(this.$refs.graph.clientWidth) - this.maxWidthLibrary;
    },
    containerHeight() {
      return Math.floor(this.$refs.graph.clientHeight);
    },
    elementConfig() {
      if (this.dataRestFrom) {
        const _tmp = this.dataRestFrom[
          this.dataRestFrom.length - 1
        ].ID.replaceAll("'", '"');
        return JSON.parse(_tmp + "}");
      } else {
        return null;
      }
    },
  },
  watch: {
    dataRestFrom(_dataRest) {
      //генерируем и рисуем ноды
      this.generateNodes(_dataRest);
      this.drawNodes();
      //генерируем и рисуем связи
      this.generateEdges(_dataRest);
      this.drawEdges();
      //применяем layot
      this.applyLayout();
    },
  },
  mounted() {
    this.createGraph();
  },
  methods: {
    drawNodes() {
      //для нод на графе, скрытая переменная yfile
      this.$graphNodes = null;

      this.nodesSource.forEach((node, index) => {
        let _imgSource = null;
        if (this.nodesSource[index].status === true) {
          _imgSource = this.elementConfig.library.primitives[
            this.nodesSource[index].type
          ].image_on;
        } else {
          _imgSource = this.elementConfig.library.primitives[
            this.nodesSource[index].type
          ].image_off;
        }
        let _node;
        if (this.nodesSource[index].anomaly === true) {
          _node = this.$graphComponent.graph.createNodeAt({
            location: node.point,
            style: new NodeStyleDecorator(
              new yfile.ImageNodeStyle(`/svg/${_imgSource}`), `/svg/warnind.svg`
            ),
            labels: [this.nodesSource[index].label],
          });
        } else {
          _node = this.$graphComponent.graph.createNodeAt({
            location: node.point,
            style: new yfile.ImageNodeStyle(`/svg/${_imgSource}`),
            labels: [this.nodesSource[index].label],
          });
        }

        this.setNodeSize(_node, this.nodesSource[index].type);
        //для дальнейшего рисования edges
        //через tag передаётся id
        _node.tag = this.nodesSource[index].id;
        if (this.$graphNodes) {
          this.$graphNodes.push(_node);
        } else {
          this.$graphNodes = [];
          this.$graphNodes.push(_node);
        }
      });
    },
    setNodeSize(node, type) {
      node.layout.width = this.elementConfig.library.primitives[type].width
        ? this.elementConfig.library.primitives[type].width
        : 30;
      node.layout.height = this.elementConfig.library.primitives[type].height
        ? this.elementConfig.library.primitives[type].height
        : 30;
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
        const _edge = this.$graphComponent.graph.createEdge(_fNode, _tNode);
        //применяем этот стиль -- this.elementConfig.library.egdes[edge.style]
        //стилизуем нарисованный edge
        this.$graphComponent.graph.setStyle(
          _edge,
          new yfile.PolylineEdgeStyle({
            stroke: `${this.elementConfig.library.egdes[edge.style].width}px ${
              this.elementConfig.library.egdes[edge.style].color
            }`,
          })
        );
      });
    },
    applyLayout() {
      const layoutData = new yfile.PolylineEdgeRouterData();
      const edgeRouter = new yfile.EdgeRouter();
      edgeRouter.scope = yfile.EdgeRouterScope.ROUTE_ALL_EDGES;
      this.$graphComponent.graph.applyLayout(edgeRouter, layoutData);
    },
    generateEdges(dataRest) {
      let _allEdges = [];
      //в последней строке доступы
      for (let i = 0; i < dataRest.length - 1; i++) {
        if (dataRest[i].edges) {
          const _tmpEdge = JSON.parse(dataRest[i].edges.replaceAll("'", '"'));
          Object.keys(_tmpEdge).forEach((key) => {
            //прохожу по всем ключам-разного типа
            _tmpEdge[key].forEach((edge) => {
              _allEdges.push({
                fromNode: Number(dataRest[i].ID),
                toNode: Number(edge),
                style: key, // стиль
              });
            });
          });
        }
      }

      //уникальная связь
      this.edgesSource = this.uniqEdges(_allEdges);
    },

    uniqEdges(allEdges) {
      let _acc = [];
      for (let i = 0; i < allEdges.length; i++) {
        let _isUniq = true;
        for (let j = 0; j < _acc.length; j++) {
          if (
            _acc[j].style === allEdges[i].style &&
            _acc[j].fromNode === allEdges[i].toNode &&
            _acc[j].toNode === allEdges[i].fromNode
          ) {
            _isUniq = false;
          }
        }
        if (_isUniq) {
          _acc.push(allEdges[i]);
        }
      }
      return _acc;
    },
    generateNodes(dataRest) {
      let _allNodes = [];
      //в последней строке доступы
      for (let i = 0; i < dataRest.length - 1; i++) {
        _allNodes.push({
          id: Number(dataRest[i].ID),
          point: new yfile.Point(
            dataRest[i].object_coordinate_X * this.containerWidth +
              this.maxWidthLibrary / 2,
            dataRest[i].object_coordinate_Y * this.containerHeight
          ),
          label: dataRest[i].object_label,
          type: dataRest[i].object_type,
          status: dataRest[i].status,
          anomaly: dataRest[i].anomaly,
        });
      }
      this.nodesSource = _allNodes;
    },

    createGraph() {
      this.$graphComponent = new yfile.GraphComponent(this.$refs.graph);
      this.$graphComponent.inputMode = null;

      this.initializeDefaultStyles();
    },
    initializeDefaultStyles() {
      //стиль для label
      this.$graphComponent.graph.nodeDefaults.labels.style = new yfile.DefaultLabelStyle(
        {
          textFill: "#b8b8b8",
          backgroundFill: "#0a0a0a",
        }
      );
      //положение label относительно ноды
      const labelModel = new yfile.ExteriorLabelModel({ insets: 4 });
      this.$graphComponent.graph.nodeDefaults.labels.layoutParameter = labelModel.createParameter(
        yfile.ExteriorLabelModelPosition.SOUTH
      );
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