import {
  License,
  GraphComponent,
  GraphViewerInputMode,
  DefaultLabelStyle,
  PolylineEdgeStyle,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  WebGL2GraphModelManager,
  WebGL2SelectionIndicatorManager,
  ImageNodeStyle,
  Point,
  EdgeRouterData,
  EdgeRouter,
  EdgeRouterScope,
  BridgeManager,
  GraphObstacleProvider,
  GraphEditorInputMode,
  GraphItemTypes,
} from 'yfiles';
import licenseData from '../../license/license.json';

License.value = licenseData; // Проверка лицензии

class BushClass {
  static uniqEdges(allEdges) {
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
  }

  options = {
    elementClientWidth: 0,
    elementClientHeight: 0,
    isViewMode: false,
    graphNodes: [],
    elementConfig: [],
    nodesSource: [], // ноды
    edgesSource: [], // связи
    jsonError: false,
    maxElementWidth: 0, // макс ширина элемента
    maxEdgeWidth: 0, // макс размер узла
  }

  get isViewMode() {
    return this.options.isViewMode;
  }

  set isViewMode(value) {
    this.options.isViewMode = value;
  }

  get elementClientWidth() {
    return this.options.elementClientWidth;
  }

  set elementClientWidth(value) {
    this.options.elementClientWidth = value;
  }

  get elementClientHeight() {
    return this.options.elementClientHeight;
  }

  set elementClientHeight(value) {
    this.options.elementClientHeight = value;
  }

  get elementConfig() {
    return this.options.elementConfig;
  }

  set elementConfig(value) {
    this.options.elementConfig = value;
  }

  get jsonError() {
    return this.options.jsonError;
  }

  set jsonError(value) {
    this.options.jsonError = value;
  }

  get maxElementWidth() {
    return this.options.maxElementWidth;
  }

  set maxElementWidth(value) {
    this.options.maxElementWidth = value;
  }

  get maxEdgeWidth() {
    return this.options.maxEdgeWidth;
  }

  set maxEdgeWidth(value) {
    this.options.maxEdgeWidth = value;
  }

  get nodesSource() {
    return this.options.nodesSource;
  }

  set nodesSource(value) {
    this.options.nodesSource = value;
  }

  get graphNodes() {
    return this.options.graphNodes;
  }

  set graphNodes(value) {
    this.options.graphNodes = value;
  }

  get containerWidth() {
    return Math.floor(this.elementClientWidth) - this.maxElementWidth;
  }

  get containerHeight() {
    return Math.floor(this.elementClientHeight);
  }

  constructor({
    HTMLElement,
  }) {
    this.graphComponent = new GraphComponent(HTMLElement);
    this.elementClientWidth = HTMLElement.clientWidth || 0;
    this.elementClientHeight = HTMLElement.clientHeight || 0;
    this.init();
    // this.enableWebGL2();
  }

  get getGraph() {
    return this.graphComponent;
  }

  enableWebGL2() {
    this.graphComponent.graphModelManager = new WebGL2GraphModelManager();
    this.graphComponent
      .selectionIndicatorManager = new WebGL2SelectionIndicatorManager(this.graphComponent);
  }

  init() {
    this.toggleInputMode();
    this.initializeDefaultStyles();
  }

  toggleInputMode(dragRes) {
    if (dragRes) {
      this.graphComponent.inputMode = null;
    } else {
      this.isViewMode = true;
      this.graphComponent.inputMode = new GraphViewerInputMode();
    }
  }

  toggleViewMode(isViewMode) {
    if (isViewMode) {
      this.isViewMode = false;
      this.graphComponent.inputMode = new GraphEditorInputMode({
        showHandleItems: GraphItemTypes.ALL & ~GraphItemTypes.NODE,
      });
    } else {
      this.isViewMode = true;
      this.graphComponent.inputMode = new GraphViewerInputMode();
    }
    return this.isViewMode;
  }

  initializeDefaultStyles() {
    // стиль для label
    this.graphComponent.graph.nodeDefaults.labels.style = new DefaultLabelStyle({
      textFill: '#b8b8b8',
      backgroundFill: '#0a0a0a',
    });
    this.graphComponent.graph.edgeDefaults.style = new PolylineEdgeStyle({
      stroke: '3px white',
    });

    // положение label относительно ноды
    const labelModel = new ExteriorLabelModel({ insets: 4 });
    this.graphComponent
      .graph.nodeDefaults.labels
      .layoutParameter = labelModel.createParameter(ExteriorLabelModelPosition.SOUTH);
  }

  setNodeSize(node, type) {
    node.layout.width = this.elementConfig.library.primitives[type].width
      ? this.elementConfig.library.primitives[type].width
      : 30;
    node.layout.height = this.elementConfig.library.primitives[type].height
      ? this.elementConfig.library.primitives[type].height
      : 30;
  }

  drawNodes() {
    // для нод на графе, скрытая переменная yfile
    // this.graphNodes = null;
    this.nodesSource.forEach((node, index) => {
      let localNode;
      let imgSource;
      if (this.nodesSource[index].anomaly === true) {
        imgSource = this.elementConfig.library
          .primitives[this.nodesSource[index].type].image_on;
        localNode = this.graphComponent.graph.createNodeAt({
          location: node.point,
          style: new ImageNodeStyle(`/svg/warning_${imgSource}`),
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
        localNode = this.graphComponent.graph.createNodeAt({
          location: node.point,
          style: new ImageNodeStyle(`/svg/${imgSource}`),
          labels: [this.nodesSource[index].label],
        });
        console.log(imgSource);
      }
      this.setNodeSize(localNode, this.nodesSource[index].type);
      // для дальнейшего рисования edges
      // через tag передаётся id
      localNode.tag = this.nodesSource[index].id;
      if (this.graphNodes) {
        this.graphNodes.push(localNode);
      } else {
        this.graphNodes = [];
        this.graphNodes.push(localNode);
      }
    });
  }

  generateElementConfig(dataRest) {
    const tmp = dataRest[dataRest.length - 1]?.ID?.replaceAll("'", '"');
    try {
      this.elementConfig = JSON.parse(tmp);
    } catch {
      this.jsonError = true;
    }
  }

  getMaxElementWidth() {
    const index = Object.keys(this.elementConfig.library.primitives)[0];
    let max = this.elementConfig.library.primitives[index].width;
    Object.values(this.elementConfig.library.primitives).forEach((pr) => {
      if (pr.width > max) {
        max = pr.width;
      }
    });
    this.maxElementWidth = max;
  }

  getMaxEdgeWidth() {
    const index = Object.keys(this.elementConfig.library.egdes)[0];
    let max = this.elementConfig.library.egdes[index].width;
    Object.values(this.elementConfig.library.egdes).forEach((edge) => {
      if (edge.width > max) {
        max = edge.width;
      }
    });
    this.maxEdgeWidth = max;
  }

  generateNodes(dataRest) {
    const allNodes = [];
    // в последней строке доступы
    for (let i = 0; i < dataRest.length - 1; i += 1) {
      allNodes.push({
        id: Number(dataRest[i].ID),
        point: new Point(
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
  }

  generateEdges(dataRest) {
    const allEdges = [];
    // в последней строке доступы
    if (dataRest?.length > 0) {
      dataRest.forEach((item) => {
        if (item?.edges) {
          const tmpEdge = JSON.parse(item.edges.replaceAll("'", '"'));
          Object.keys(tmpEdge).forEach((key) => {
            // прохожу по всем ключам-разного типа
            tmpEdge[key].forEach((edge) => {
              allEdges.push({
                fromNode: Number(item.ID),
                toNode: Number(edge),
                style: key, // стиль
              });
            });
          });
        }
      });
    }

    // уникальная связь
    const edgesSource = BushClass.uniqEdges(allEdges);
    // sort TODO!!
    const sort = [];
    edgesSource.forEach((edge) => {
      if (edge.style === 'oil') {
        sort.unshift(edge);
      } else {
        sort.push(edge);
      }
    });
    this.edgesSource = sort;
  }

  drawEdges() {
    this.edgesSource.forEach((edge) => {
      let fNode = null;
      let tNode = null;
      this.graphNodes.forEach((gNode) => {
        if (gNode.tag === edge.fromNode) {
          fNode = gNode;
        }
        if (gNode.tag === edge.toNode) {
          tNode = gNode;
        }
      });
      const newEdge = this.graphComponent.graph.createEdge(fNode, tNode);
      // применяем этот стиль -- this.elementConfig.library.egdes[edge.style]
      console.log('this.elementConfig.library.egdes', this.elementConfig.library.egdes);
      // стилизуем нарисованный edge
      this.graphComponent.graph.setStyle(
        newEdge,
        new PolylineEdgeStyle({
          stroke: `${this.elementConfig.library.egdes[edge.style].width}px ${
            this.elementConfig.library.egdes[edge.style].color
          }`,
        }),
      );
    });
  }

  applyLayout() {
    const layoutData = new EdgeRouterData();
    const edgeRouter = new EdgeRouter();
    // чтобы узлы не сливались
    edgeRouter.defaultEdgeLayoutDescriptor.minimumEdgeToEdgeDistance = this.maxEdgeWidth * 2;

    edgeRouter.scope = EdgeRouterScope.ROUTE_ALL_EDGES;

    this.graphComponent.graph.applyLayout(edgeRouter, layoutData);

    const bridgeManager = new BridgeManager();
    bridgeManager.canvasComponent = this.graphComponent;
    bridgeManager.addObstacleProvider(new GraphObstacleProvider());
  }

  drawGraph(dataRest) {
    // очистка графа
    this.graphComponent.graph.clear();
    // библиотека
    this.generateElementConfig(dataRest);
    // если из dataRest забрали библиотеку
    if (!this.jsonError) {
      // max-width-lib
      this.getMaxElementWidth();
      // maxWidthEdge
      this.getMaxEdgeWidth();
      // генерируем и рисуем ноды
      this.generateNodes(dataRest);
      this.drawNodes();
      // генерируем и рисуем связи
      this.generateEdges(dataRest);
      this.drawEdges();
      // применяем layout
      this.applyLayout();
    }
  }
}

export default BushClass;
