<template>
  <div class="bush-wrapper">
    <div class="bush-ygraph-container" ref="graph" />
  </div>
</template>


<script>
import * as yfile from "yfiles";
import licenseData from "./license.json";
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
      isUniqEdges: true,
    };
  },
  computed: {
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
      const _dataRest = val
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

      this.nodesCoords.forEach((node, index) => {
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

        const _node = this.$graphComponent.graph.createNodeAt({
          location: new yfile.Point(
            (-1 * this.Xmin + node.x) / this.Kproportion,
            node.y / this.Kproportion
          ),
          style: new yfile.ImageNodeStyle(`/svg/${_imgSource}`),
          labels: [this.nodesSource[index].label],
        });
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
      const layoutData = new yfile.PolylineEdgeRouterData()
      const edgeRouter = new yfile.EdgeRouter()
      edgeRouter.scope = yfile.EdgeRouterScope.ROUTE_ALL_EDGES
      this.$graphComponent.graph.applyLayout(edgeRouter, layoutData)

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
          type: dataRest[i].object_type,
          status: dataRest[i].status,
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