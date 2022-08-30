import {
  ShapeNodeStyle,
  GraphComponent,
  GraphEditorInputMode,
  ExteriorLabelModel,
  GraphItemTypes,
  IEdge,
  INode,
  Stroke,
  Color,
  ArrowType,
  Arrow,
  PolylineEdgeStyle,
  EdgeStyleDecorationInstaller,
  StyleDecorationZoomPolicy,
  GraphViewerInputMode,
  BezierEdgeStyle,
  Key,
  ModifierKeys,
  Size,
  ICommand,
  GraphBuilder,
  HierarchicLayoutData,
  NodeHalo,
  HierarchicLayout,
  Font,
  DefaultLabelStyle,
  License,
  GraphMLSupport,
  StorageLocation,
  HierarchicLayoutNodeLayoutDescriptor,
  HierarchicLayoutPortAssignmentMode,
  SimplexNodePlacer, Point,
} from 'yfiles';
import licenseData from '../../license/license.json';

License.value = licenseData; // проверка лицензии
const labelFont = new Font({
  fontSize: 40,
  fontFamily: 'ProximaNova',
});
const labelFontBOLD = new Font({
  fontSize: 70,
  fontFamily: 'ProximaNova',
  fontWeight: 'BOLD',
});

class GraphClass {
  static nodeStyle(color) {
    return new ShapeNodeStyle({
      fill: color || this.startFinishColor,
      shape: 'ELLIPSE',
      stroke: color || this.startFinishColor,
    });
  }

  options = {
    labelStyleList: {}, // варианты labelStyle
    edgeStyleList: {},
    currentNode: null,
    startFinishColor: '#C7C7C7',
    errorColor: '#D34C00',
    colorFrom: '',
    nodesSource: [],
    edgesSource: [],
    isVisiblePopup: false,
  }

  constructor({
    elem,
    colors,
    colorFrom,
    popupCallback,
  }) {
    this.graphComponent = new GraphComponent(elem);
    this.colors = colors;
    this.options.colorFrom = colorFrom;
    this.popupCallback = popupCallback;
    const support = new GraphMLSupport(this.graphComponent);
    support.storageLocation = StorageLocation.FILE_SYSTEM;
  }

  get labelStyleList() {
    return this.options.labelStyleList;
  }

  set labelStyleList(value) {
    this.options.labelStyleList = value;
  }

  get edgeStyleList() {
    return this.options.edgeStyleList;
  }

  set edgeStyleList(value) {
    this.options.edgeStyleList = value;
  }

  get currentNode() {
    return this.options.currentNode;
  }

  set currentNode(value) {
    this.options.currentNode = value;
  }

  get startFinishColor() {
    return this.options.startFinishColor;
  }

  set startFinishColor(value) {
    this.options.startFinishColor = value;
  }

  get errorColor() {
    return this.options.errorColor;
  }

  set errorColor(value) {
    this.options.errorColor = value;
  }

  get nodesSource() {
    return this.options.nodesSource;
  }

  set nodesSource(value) {
    this.options.nodesSource = value;
  }

  get edgesSource() {
    return this.options.edgesSource;
  }

  set edgesSource(value) {
    this.options.edgesSource = value;
  }

  get colorFrom() {
    return this.options.colorFrom;
  }

  set colorFrom(value) {
    this.options.colorFrom = value;
  }

  get isVisiblePopup() {
    return this.options.isVisiblePopup;
  }

  set isVisiblePopup(value) {
    this.options.isVisiblePopup = value;
  }

  hoverItemListener(mode) {
    mode.itemHoverInputMode.enabled = true;
    mode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE || GraphItemTypes.NODE;
    mode.itemHoverInputMode.discardInvalidItems = false;
    mode.itemHoverInputMode.addHoveredItemChangedListener((sender, e) => {
      const manager = this.graphComponent.highlightIndicatorManager;
      // first remove previous highlights
      manager.clearHighlights();

      const { item } = e;
      if (item) {
        manager.addHighlight(item);
        if (item instanceof INode) {
          // and if it's a node, we highlight all adjacent edges, too
          this.graphComponent.graph.edgesAt(item).forEach((edge) => {
            manager.addHighlight(edge);
          });
        } else if (item instanceof IEdge) {
          // if it's an edge - we highlight the adjacent nodes
          manager.addHighlight(item.sourceNode);
          manager.addHighlight(item.targetNode);
        }
      }
      if (item instanceof IEdge) {
        this.popupCallback({
          type: 'edge',
          content: {
            sourceName: GraphClass.extractNodeName(item.sourcePort.owner.tag),
            targetName: GraphClass.extractNodeName(item.targetPort.owner.tag),
            metricValue: item.tag.metric,
          },
        });
      } else {
        this.popupCallback({
          type: 'edge',
          content: null,
        });
      }
    });
  }

  static extractNodeName(nodeTag) {
    return typeof nodeTag === 'string'
      ? `metric: ${nodeTag}`
      : `${nodeTag.node || nodeTag.label}`;
  }

  initMode({
    modeOptions,
    callback,
  }) {
    const mode = new GraphEditorInputMode(modeOptions);
    mode.addItemClickedListener(callback);
    this.hoverItemListener(mode);
    // On clicks on empty space, set currentItem to <code>null</code> to hide the pop-ups
    mode.addCanvasClickedListener(() => {
      this.graphComponent.currentItem = null;
    });
    this.graphComponent.inputMode = mode;
  }

  edgeStyle(color) {
    if (color === undefined) {
      [color] = this.colors;
    }
    const key = `edgeStyle_${color}`;
    if (!this.edgeStyleList[key]) {
      this.edgeStyleList[key] = new PolylineEdgeStyle({
        stroke: `4px ${color}`,
        targetArrow: new Arrow({
          fill: color,
          scale: 5,
          type: 'TRIANGLE',
        }),
      });
    }
    return this.edgeStyleList[key];
  }

  initializeDefaultStyles() {
    this.graphComponent.graph.nodeDefaults.style = GraphClass.nodeStyle('#0AB3FF');
    this.graphComponent.graph.nodeDefaults.size = new Size(120, 120);

    this.graphComponent.graph.edgeDefaults.style = this.edgeStyle('#0AB3FF');
    this.graphComponent.graph.edgeDefaults.labels.style.minimumSize = new Size(70 * 3, 0);

    const orangeRed = Color.ORANGE_RED;
    const orangeStroke = new Stroke(
      orangeRed.r,
      orangeRed.g,
      orangeRed.b,
      255,
      3,
    );
    // freeze it for slightly improved performance
    orangeStroke.freeze();

    // now decorate the nodes and edges with custom hover highlight styles
    const { decorator } = this.graphComponent.graph;

    // a similar style for the edges, however cropped by the highlight's insets
    const dummyCroppingArrow = new Arrow({
      type: ArrowType.NONE,
      cropLength: 5,
    });

    const edgeStyle = new PolylineEdgeStyle({
      stroke: orangeStroke, // `6px red`
      targetArrow: dummyCroppingArrow,
      sourceArrow: dummyCroppingArrow,
    });
    const edgeStyleHighlight = new EdgeStyleDecorationInstaller({
      edgeStyle,
      zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES,
    });

    const bezierEdgeStyle = new BezierEdgeStyle({
      stroke: orangeStroke,
      targetArrow: dummyCroppingArrow,
      sourceArrow: dummyCroppingArrow,
    });
    const bezierEdgeStyleHighlight = new EdgeStyleDecorationInstaller({
      edgeStyle: bezierEdgeStyle,
      zoomPolicy: StyleDecorationZoomPolicy.VIEW_COORDINATES,
    });

    decorator.edgeDecorator.highlightDecorator
      .setFactory(
        (edge) => (edge.style instanceof BezierEdgeStyle
          ? bezierEdgeStyleHighlight
          : edgeStyleHighlight),
      );
  }

  initializePopups({
    inputMode,
    callback,
  }) {
    inputMode.addItemClickedListener((sender, evt) => {
      setTimeout(() => {
        const { item } = evt;
        if (item instanceof INode) {
          this.currentNode = item.tag;
          // open node pop-up and hide edge pop-up
          this.popupCallback({
            type: 'node',
            content: {
              data: item.tag,
              position: this.getElementPosition(item.layout),
              node: item.tag?.node || item.tag?.label,
              nodeDescription: item.tag?.node_description || item.tag?.label,
            },
          });
        } else {
          this.popupCallback({
            type: 'node',
            content: null,
          });
        }
      }, 0);
    });

    this.graphComponent.addMouseClickListener(() => {
      this.popupCallback({
        type: 'node',
        content: null,
      });
    });

    // The pop-up is shown for the currentItem thus nodes and edges should be focusable
    inputMode.focusableItems = GraphItemTypes.NODE || GraphItemTypes.EDGE;
    this.hoverItemListener(inputMode);

    // On press of the ESCAPE key, set currentItem to <code>null</code> to hide the pop-ups
    inputMode.keyboardInputMode.addKeyBinding(
      Key.ESCAPE,
      ModifierKeys.NONE,
      (command, parameter, source) => {
        this.currentNode = null;
        callback(this.currentNode);
        source.currentItem = null;
        return true;
      },
    );
    return inputMode;
  }

  getElementPosition({ x, y }, defaultIndent = 20) {
    let indent = defaultIndent;
    const { zoom } = this.graphComponent;
    indent /= zoom;
    const position = this.graphComponent.toViewCoordinates(
      new Point(
        x + indent,
        y,
      ),
    );
    return {
      x: position.x,
      y: position.y,
    };
  }

  viewerInputMode() {
    this.graphComponent.inputMode = this.initializePopups({
      callback: this.popupCallback,
      inputMode: new GraphViewerInputMode(),
    });
  }

  zoomIn() {
    ICommand.INCREASE_ZOOM.execute(null, this.graphComponent);
  }

  zoomOut() {
    ICommand.DECREASE_ZOOM.execute(null, this.graphComponent);
  }

  closeNodePopup() {
    this.popupCallback({
      type: 'node',
      content: null,
    });
  }

  fitContent() {
    return ICommand.FIT_GRAPH_BOUNDS.execute(null, this.graphComponent);
  }

  colorEdges() {
    const { edges } = this.graphComponent.graph;
    edges.forEach((edge) => {
      if (edge.tag === '-') {
        this.graphComponent.graph.setStyle(
          edge,
          this.edgeStyle(this.startFinishColor),
        );
      } else if (edge.tag === '-1') {
        this.graphComponent.graph.setStyle(
          edge,
          this.edgeStyle(this.errorColor),
        );
      } else {
        this.graphComponent.graph.setStyle(
          edge,
          this.edgeStyle(this.colors[edge.tag.color % this.colors.length]),
        );
      }
    });
  }

  async generateNodesEdges(dataRest, callback) {
    await new Promise((resolve) => {
      const allNodes = [];
      const allEdges = [];
      // Генерация и привязка nodes к edges
      dataRest.forEach((dataRestItem) => {
        if (dataRestItem.relation_id) {
          allEdges.push({
            fromNode: `${dataRestItem.id}`,
            toNode: dataRestItem.relation_id,
            label: dataRestItem.edge_description,
            color: dataRestItem.edge_color,
          });
        }
        allNodes.push(dataRestItem);
      });

      const nodesSource = Object.values(
        allNodes.reduce((obj, item) => ({ ...obj, [item.id]: item }), {}),
      );

      callback(nodesSource);

      this.nodesSource = nodesSource;
      this.edgesSource = allEdges;
      resolve();
    });
  }

  applyGraphBuilder() {
    new Promise((resolve) => {
      this.graphComponent.graph.clear();

      const graphBuilder = new GraphBuilder(this.graphComponent.graph);

      const nodesSource = graphBuilder.createNodesSource({
        data: this.nodesSource, // .slice(0,10),
        id: 'id',
        tag: (item) => item,
      });

      // label name для nodes
      const nodeNameCreator = nodesSource.nodeCreator.createLabelBinding(
        (nodeDataItem) => {
          if (nodeDataItem.node.length > 10) {
            const itemLength = nodeDataItem.node.split(' ').length - 1;
            if (itemLength >= 1 && itemLength < 3) {
              return nodeDataItem.node.replace(' ', '\n');
            }
            const item = nodeDataItem.node.split(' ');
            item.splice(3, 0, '\n');
            return item.join(' ');
          }
          return nodeDataItem.node;
        },
      );
      nodeNameCreator.defaults.layoutParameter = ExteriorLabelModel.NORTH_EAST;

      // label label для nodes
      const nodeLabelCreator = nodesSource.nodeCreator.createLabelBinding(
        (nodeDataItem) => nodeDataItem.label,
      );

      nodeLabelCreator.defaults.layoutParameter = ExteriorLabelModel.EAST;

      // генерация edges
      const edgesSource = graphBuilder.createEdgesSource({
        data: this.edgesSource,
        sourceId: 'fromNode',
        targetId: 'toNode',
        tag: (item) => ({
          color: item.color,
          metric: item.label,
        }),
      });

      edgesSource.edgeCreator.createLabelBinding((edgeDataItem) => {
        if (edgeDataItem.label !== '-') {
          if (edgeDataItem.label?.length > 10) {
            const itemLength = edgeDataItem.label.split(' ').length - 1;
            if (itemLength >= 1 && itemLength < 3) {
              return edgeDataItem.label.replace(' ', '\n');
            }
            const item = edgeDataItem.label.split(' ');
            item.splice(3, 0, '\n');
            return item.join(' ');
          }
          return edgeDataItem.label;
        }
        return '';
      });

      this.graphComponent.graph = graphBuilder.buildGraph();
      // отступы для нод
      const layoutData = new HierarchicLayoutData({
        nodeHalos: NodeHalo.create(50, 300, 50, 300),
      });
      // настройки для layout
      const layout = new HierarchicLayout({
        integratedEdgeLabeling: true,
        separateLayers: false,
        considerNodeLabels: true,
        automaticEdgeGrouping: false,
        nodePlacer: new SimplexNodePlacer({
          labelCompaction: true,
        }),
        gridSpacing: 80,
        nodeLayoutDescriptor: new HierarchicLayoutNodeLayoutDescriptor({
          portAssignment: HierarchicLayoutPortAssignmentMode.DEFAULT,
        }),
      });
      layout.nodeToNodeDistance = 301;
      layout.minimumLayerDistance = 201;

      // применяем layout
      this.graphComponent.graph.applyLayout({
        layout,
        layoutData,
      });
      resolve();
    }).then(() => {
      this.fitContent();
    });
  }

  colorFont() {
    const { nodes } = this.graphComponent.graph;
    nodes.forEach((node) => {
      // node.labels.elementAt(0) -- label который name
      this.graphComponent.graph.setStyle(
        node.labels.elementAt(0),
        this.labelStyle(true),
      );
      // node.labels.elementAt(1) -- label который label
      this.graphComponent.graph.setStyle(
        node.labels.elementAt(1),
        this.labelStyle(false),
      );
    });

    const { edges } = this.graphComponent.graph;
    edges.forEach((edge) => {
      this.graphComponent.graph.setStyle(
        edge.labels.elementAt(0),
        this.labelStyle(false, this.colorFrom.backElement),
      );
    });
  }

  labelStyle(isBold, backgroundFill = null) {
    const key = `${isBold ? 'b' : 'r'}_${backgroundFill || 'default'}_${
      this.colorFrom.$main_text
    }`;
    // создаем только отличающиеся стили
    if (!this.labelStyleList[key]) {
      this.labelStyleList[key] = new DefaultLabelStyle({
        font: isBold ? labelFontBOLD : labelFont,
        textFill: this.colorFrom.$main_text,
        backgroundFill,
      });
    }
    return this.labelStyleList[key];
  }

  colorNodes() {
    const { nodes } = this.graphComponent.graph;
    nodes.forEach((node) => {
      if (
        typeof node.tag.node_color === 'string'
        && (node.tag.node_color.toLowerCase() === 'start'
          || node.tag.node_color.toLowerCase() === 'finish')
      ) {
        this.graphComponent.graph.setStyle(
          node,
          GraphClass.nodeStyle(this.startFinishColor),
        );
      } else if (node.tag.node_color === '-1') {
        this.graphComponent.graph.setStyle(
          node,
          GraphClass.nodeStyle(this.errorColor),
        );
      } else {
        this.graphComponent.graph.setStyle(
          node,
          GraphClass.nodeStyle(
            this.colors[node.tag.node_color - 1]
            || this.startFinishColor,
          ),
        );
      }
    });
  }

  initializeDefault() {
    this.initializeDefaultStyles();
    this.initializePopups({
      callback: this.popupCallback,
      inputMode: this.graphComponent.inputMode,
    });
  }

  reDrawNodesEdges(data, callback) {
    this.generateNodesEdges(data, callback).then(() => {
      this.applyGraphBuilder();
      this.colorFont();
      this.colorNodes();
      this.colorEdges();
    });
  }
}

export default GraphClass;
