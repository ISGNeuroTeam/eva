<template>
  <div id="bush-wrapper">
    <div
      v-if="jsonError"
      class="error-message"
      :style="`height: ${heightPanel};`"
    >
      Ошибка формата входных данных
    </div>
    <div v-else>
      <div
        v-if="dragRes"
        class="buttons-wrapper"
      >
        <v-icon :color="'white'">
          {{ icon.close }}
        </v-icon>
      </div>
      <div
        v-else
        class="buttons-wrapper"
      >
        <v-icon
          v-if="isViewMode"
          :color="'white'"
          @click="clickViewMode"
        >
          {{ icon.move }}
        </v-icon>
        <v-icon
          v-else
          :color="'white'"
          @click="clickEditorMode"
        >
          {{ icon.pencil }}
        </v-icon>
      </div>
      <div
        ref="graph"
        class="bush-ygraph-container"
        :style="{ top: `${top}` }"
      />
    </div>
  </div>
</template>

<script>
import * as yfile from 'yfiles';
import { mdiClose, mdiCursorMove, mdiPencil } from '@mdi/js';
import licenseData from './license.json';

yfile.License.value = licenseData; // проверка лицензии

export default {
  name: 'DashBush',
  props: {
    // переменные полученные от родителя
    idFrom: {
      type: String,
      required: true,
    }, // id элемнета (table, graph-2)
    idDashFrom: {
      type: String,
      required: true,
    }, // id дашборда
    dataRestFrom: {
      type: Array,
      required: true,
    }, // данные полученые после выполнения запроса
    colorFrom: {
      type: Object,
      required: true,
    }, // цветовые переменные
    widthFrom: {
      type: Number,
      required: true,
    }, // ширина родительского компонента
    heightFrom: {
      type: Number,
      required: true,
    }, // выоста родительского компонента
  },
  data() {
    return {
      nodesSource: null, // ноды
      edgesSource: null, // связи
      maxElementWidth: 0, // макс ширина элемента
      maxEdgeWidth: 0, // макс размер узла
      jsonError: false,
      isViewMode: true,
      elementConfig: null, // библиотека
      icon: {
        close: mdiClose,
        move: mdiCursorMove,
        pencil: mdiPencil,
      },
    };
  },
  computed: {
    top() {
      // для ряда управляющих иконок
      return document.body.clientWidth <= 1600 ? '50px' : '60px';
    },
    widthPanel() {
      return `${this.widthFrom / 10}px`;
    },
    heightPanel() {
      return `${this.heightFrom}px`;
    },
    dashFromStore() {
      return this.$store.state[this.idDashFrom];
    },
    getDragRes() {
      return this.dashFromStore.dragRes;
    },
    dragRes() {
      const dragRes = this.getDragRes;
      return dragRes === 'true';
    },
    containerWidth() {
      return Math.floor(this.$refs.graph.clientWidth) - this.maxElementWidth;
    },
    containerHeight() {
      return Math.floor(this.$refs.graph.clientHeight);
    },
  },
  watch: {
    dragRes(val) {
      if (val === true) {
        this.$graphComponent.inputMode = null;
      } else {
        this.isViewMode = true;
        this.$graphComponent.inputMode = new yfile.GraphViewerInputMode();
      }
    },
    dataRestFrom(_dataRest) {
      if (_dataRest.length > 0) {
        this.drawGraph(_dataRest);
      }
    },
  },
  async mounted() {
    await this.createGraph();
    if (this.dataRestFrom.length > 0) {
      this.drawGraph(this.dataRestFrom);
    }
  },
  methods: {
    drawGraph(_dataRest) {
      // очистка графа
      this.$graphComponent.graph.clear();
      // библиотека
      this.generateElementConfig(_dataRest);
      // если из dataRest забрали библиотеку
      if (!this.jsonError) {
        // maxwidthlib
        this.getMaxElementWidth();
        // maxWidthEdge
        this.getMaxEdgeWidth();
        // генерируем и рисуем ноды
        this.generateNodes(_dataRest);
        this.drawNodes();
        // генерируем и рисуем связи
        this.generateEdges(_dataRest);
        this.drawEdges();
        // применяем layot
        this.applyLayout();
      }
    },
    clickViewMode() {
      this.isViewMode = false;
      this.$graphComponent.inputMode = new yfile.GraphEditorInputMode({
        showHandleItems: yfile.GraphItemTypes.ALL & ~yfile.GraphItemTypes.NODE,
      });
    },
    clickEditorMode() {
      this.isViewMode = true;
      this.$graphComponent.inputMode = new yfile.GraphViewerInputMode();
    },
    generateElementConfig(dataRest) {
      const tmp = dataRest[dataRest.length - 1]?.ID?.replaceAll("'", '"');
      try {
        this.elementConfig = JSON.parse(tmp);
      } catch {
        this.jsonError = true;
      }
    },
    getMaxElementWidth() {
      const index = Object.keys(this.elementConfig.library.primitives)[0];
      let max = this.elementConfig.library.primitives[index].width;
      Object.values(this.elementConfig.library.primitives).forEach((pr) => {
        if (pr.width > max) {
          max = pr.width;
        }
      });
      this.maxElementWidth = max;
    },
    getMaxEdgeWidth() {
      const index = Object.keys(this.elementConfig.library.egdes)[0];
      let max = this.elementConfig.library.egdes[index].width;
      Object.values(this.elementConfig.library.egdes).forEach((edge) => {
        if (edge.width > max) {
          max = edge.width;
        }
      });
      this.maxEdgeWidth = max;
    },
    drawNodes() {
      // для нод на графе, скрытая переменная yfile
      this.$graphNodes = null;

      this.nodesSource.forEach((node, index) => {
        let localNode;
        let imgSource;
        if (this.nodesSource[index].anomaly === true) {
          imgSource = this.elementConfig.library
            .primitives[this.nodesSource[index].type].image_on;
          localNode = this.$graphComponent.graph.createNodeAt({
            location: node.point,
            style: new yfile.ImageNodeStyle(`/svg/warning_${imgSource}`),
            labels: [this.nodesSource[index].label],
          });
        } else {
          if (this.nodesSource[index].status === true) {
            imgSource = this.elementConfig.library
              .primitives[this.nodesSource[index].type].image_on;
          } else {
            imgSource = this.elementConfig.library
              .primitives[this.nodesSource[index].type].image_off;
          }
          localNode = this.$graphComponent.graph.createNodeAt({
            location: node.point,
            style: new yfile.ImageNodeStyle(`/svg/${imgSource}`),
            labels: [this.nodesSource[index].label],
          });
        }

        this.setNodeSize(localNode, this.nodesSource[index].type);
        // для дальнейшего рисования edges
        // через tag передаётся id
        localNode.tag = this.nodesSource[index].id;
        if (this.$graphNodes) {
          this.$graphNodes.push(localNode);
        } else {
          this.$graphNodes = [];
          this.$graphNodes.push(localNode);
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
        let fNode = null;
        let tNode = null;
        this.$graphNodes.forEach((gNode) => {
          if (gNode.tag === edge.fromNode) {
            fNode = gNode;
          }
          if (gNode.tag === edge.toNode) {
            tNode = gNode;
          }
        });
        const newEdge = this.$graphComponent.graph.createEdge(fNode, tNode);
        // применяем этот стиль -- this.elementConfig.library.egdes[edge.style]
        // стилизуем нарисованный edge
        this.$graphComponent.graph.setStyle(
          newEdge,
          new yfile.PolylineEdgeStyle({
            stroke: `${this.elementConfig.library.egdes[edge.style].width}px ${
              this.elementConfig.library.egdes[edge.style].color
            }`,
          }),
        );
      });
    },
    applyLayout() {
      const layoutData = new yfile.PolylineEdgeRouterData();
      const edgeRouter = new yfile.EdgeRouter();
      // чтобы узлы не сливались
      edgeRouter.defaultEdgeLayoutDescriptor.minimumEdgeToEdgeDistance = this.maxEdgeWidth * 2;

      edgeRouter.scope = yfile.EdgeRouterScope.ROUTE_ALL_EDGES;

      this.$graphComponent.graph.applyLayout(edgeRouter, layoutData);

      const bridgeManager = new yfile.BridgeManager();
      bridgeManager.canvasComponent = this.$graphComponent;
      bridgeManager.addObstacleProvider(new yfile.GraphObstacleProvider());
    },
    generateEdges(dataRest) {
      const allEdges = [];
      // в последней строке доступы
      for (let i = 0; i < dataRest.length - 1; i += 1) {
        if (dataRest[i].edges) {
          const tmpEdge = JSON.parse(dataRest[i].edges.replaceAll("'", '"'));
          Object.keys(tmpEdge).forEach((key) => {
            // прохожу по всем ключам-разного типа
            tmpEdge[key].forEach((edge) => {
              allEdges.push({
                fromNode: Number(dataRest[i].ID),
                toNode: Number(edge),
                style: key, // стиль
              });
            });
          });
        }
      }

      // уникальная связь
      this.edgesSource = this.uniqEdges(allEdges);
      // sort TODO!!
      const sort = [];
      this.edgesSource.forEach((edge) => {
        if (edge.style === 'oil') {
          sort.unshift(edge);
        } else {
          sort.push(edge);
        }
      });
      this.$set(this, 'edgesSource', sort);
    },

    uniqEdges(allEdges) {
      const acc = [];
      for (let i = 0; i < allEdges.length; i += 1) {
        let isUniq = true;
        for (let j = 0; j < acc.length; j += 1) {
          if (
            acc[j].style === allEdges[i].style
            && acc[j].fromNode === allEdges[i].toNode
            && acc[j].toNode === allEdges[i].fromNode
          ) {
            isUniq = false;
          }
        }
        if (isUniq) {
          acc.push(allEdges[i]);
        }
      }
      return acc;
    },
    generateNodes(dataRest) {
      const allNodes = [];
      // в последней строке доступы
      for (let i = 0; i < dataRest.length - 1; i += 1) {
        allNodes.push({
          id: Number(dataRest[i].ID),
          point: new yfile.Point(
            dataRest[i].object_coordinate_X * this.containerWidth
              + this.maxElementWidth / 2,
            dataRest[i].object_coordinate_Y * this.containerHeight,
          ),
          label: dataRest[i].object_label,
          type: dataRest[i].object_type,
          status: dataRest[i].status,
          anomaly: dataRest[i].anomaly,
        });
      }
      this.nodesSource = allNodes;
    },

    async createGraph() {
      this.$graphComponent = await new yfile.GraphComponent(this.$refs.graph);
      if (this.dragRes) {
        this.$graphComponent.inputMode = null;
      } else {
        this.isViewMode = true;
        this.$graphComponent.inputMode = new yfile.GraphViewerInputMode();
      }

      this.initializeDefaultStyles();
    },
    initializeDefaultStyles() {
      // стиль для label
      this.$graphComponent.graph.nodeDefaults.labels.style = new yfile.DefaultLabelStyle({
        textFill: '#b8b8b8',
        backgroundFill: '#0a0a0a',
      });
      this.$graphComponent.graph.edgeDefaults.style = new yfile.PolylineEdgeStyle({
        stroke: '3px white',
      });

      // положение label относительно ноды
      const labelModel = new yfile.ExteriorLabelModel({ insets: 4 });
      this.$graphComponent
        .graph.nodeDefaults.labels
        .layoutParameter = labelModel.createParameter(yfile.ExteriorLabelModelPosition.SOUTH);
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
.buttons-wrapper {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
.error-message {
  display: flex;
  justify-content: center;
  flex-direction: column;
  font-size: 25px;
}
</style>
