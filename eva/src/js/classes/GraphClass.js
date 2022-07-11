import {
  ShapeNodeStyle,
  GraphComponent,
  GraphEditorInputMode,
  EdgePathLabelModel,
  ExteriorLabelModel,
  ExteriorLabelModelPosition,
  GraphItemTypes,
  IEdge,
  INode,
  Point,
  Stroke,
  Color,
  ArrowType,
  Arrow,
  PolylineEdgeStyle,
  EdgeStyleDecorationInstaller,
  StyleDecorationZoomPolicy,
  GraphViewerInputMode,
  BezierEdgeStyle,
  TimeSpan,
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
  WebGL2GraphModelManager,
  WebGL2SelectionIndicatorManager,
} from 'yfiles';
import HTMLPopupSupport from './HTMLPopupSupport';
import licenseData from '../../license/license.json';

License.value = licenseData; // проверка лицензии
const labelFont = new Font({
  fontSize: 50,
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

  static createTooltipContent(item) {
    if (!IEdge.isInstance(item)) {
      // not IPort, ILabel, INode
      return null;
    }
    // build the tooltip container
    const tooltip = document.createElement('div');

    let labelFrom = '';
    let labelTo = '';
    if (item.sourceNode.labels.size > 0) {
      labelFrom = item.sourceNode.labels.last().text;
    }
    if (item.targetNode.labels.size > 0) {
      labelTo = item.targetNode.labels.last().text;
    }

    if (!!labelFrom || !!labelTo) {
      const title = document.createElement('h4');
      title.innerHTML = `${labelFrom} -> ${labelTo}`;
      tooltip.appendChild(title);
    }

    // extract the first label from the item
    let label = '';
    if (item.labels.size > 0) {
      label = item.labels.first().text;
    }
    const text = document.createElement('p');
    text.innerHTML = label;
    tooltip.appendChild(text);

    return tooltip;
  }

  static updateNodePopupContent(nodePopup, node) {
    // get business data from node tag
    const data = node.tag;

    // get all divs in the pop-up
    const divs = nodePopup.div.getElementsByTagName('div');
    for (let i = 0; i < divs.length; i += 1) {
      const div = divs.item(i);
      if (div.hasAttribute('data-id')) {
        // if div has a 'data-id' attribute, get content from the business data
        const id = div.getAttribute('data-id') || 'label';
        div.textContent = data[id];
      }
    }
  }

  static updateEdgePopupContent(edgePopup, edge) {
    // get business data from node tags
    const target = {
      sourceName: edge.sourcePort.owner.tag,
      targetName: edge.targetPort.owner.tag,
    };

    // get all divs in the pop-up
    const divs = edgePopup.div.getElementsByTagName('div');
    for (let i = 0; i < divs.length; i += 1) {
      const div = divs.item(i);
      if (div.hasAttribute('data-id')) {
        // if div has a 'data-id' attribute, get content from the business data
        const id = div.getAttribute('data-id');
        const data = target[id];
        if (data) {
          const label = data.node || data.label;
          div.textContent = `Node: ${label}`;
        }
      }
    }
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
  }

  constructor({
    elem,
    colors,
    colorFrom,
  }) {
    this.graphComponent = new GraphComponent(elem);
    this.colors = colors;
    this.options.colorFrom = colorFrom;
    this.enableWebGL2();
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

  enableWebGL2() {
    this.graphComponent.graphModelManager = new WebGL2GraphModelManager();
    this.graphComponent
      .selectionIndicatorManager = new WebGL2SelectionIndicatorManager(this.graphComponent);
  }

  initMode({
    modeOptions,
    callback,
  }) {
    const mode = new GraphEditorInputMode(modeOptions);
    mode.addItemClickedListener(callback);
    mode.itemHoverInputMode.enabled = true;
    mode.itemHoverInputMode.hoverItems = GraphItemTypes.EDGE || GraphItemTypes.NODE;
    mode.itemHoverInputMode.discardInvalidItems = false;
    mode.itemHoverInputMode.addHoveredItemChangedListener((sender, e) => {
      const manager = this.graphComponent.highlightIndicatorManager;
      // first remove previous highlights
      manager.clearHighlights();

      if (e.item) {
        const newItem = e.item;

        manager.addHighlight(newItem);
        if (newItem instanceof INode) {
          // and if it's a node, we highlight all adjacent edges, too
          this.graphComponent.graph.edgesAt(newItem).forEach((edge) => {
            manager.addHighlight(edge);
          });
        } else if (newItem instanceof IEdge) {
          // if it's an edge - we highlight the adjacent nodes
          manager.addHighlight(newItem.sourceNode);
          manager.addHighlight(newItem.targetNode);
        }
      }
    });
    // On clicks on empty space, set currentItem to <code>null</code> to hide the pop-ups
    mode.addCanvasClickedListener(() => {
      this.graphComponent.currentItem = null;
    });
    this.graphComponent.inputMode = mode;
  }

  testSave() {
    ICommand.SAVE.execute(null, this.graphComponent);
  }

  testOpen() {
    ICommand.OPEN.execute(null, this.graphComponent);
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

  initializeTooltips() {
    const { inputMode } = this.graphComponent;
    // Customize the tooltip's behavior to our liking.
    const { mouseHoverInputMode } = inputMode;
    mouseHoverInputMode.toolTipLocationOffset = new Point(15, 15);
    mouseHoverInputMode.delay = TimeSpan.fromMilliseconds(500);
    mouseHoverInputMode.duration = TimeSpan.fromSeconds(5);

    // Register a listener for when a tooltip should be shown.
    inputMode.addQueryItemToolTipListener((src, eventArgs) => {
      if (eventArgs.handled) {
        // Tooltip content has already been assigned -> nothing to do.
        return;
      }

      // Use a rich HTML element as tooltip content.
      // Alternatively, a plain string would do as well.
      eventArgs.toolTip = GraphClass.createTooltipContent(eventArgs.item);

      // Indicate that the tooltip content has been set.
      eventArgs.handled = true;
    });
  }

  initializePopups({ nodePopupContent, edgePopupContent, callback }) {
    // Creates a label model parameter that is used to position the node pop-up
    const nodeLabelModel = new ExteriorLabelModel({ insets: 10 });

    // Creates the pop-up for the node pop-up template
    const nodePopup = new HTMLPopupSupport(
      this.graphComponent,
      nodePopupContent,
      nodeLabelModel.createParameter(ExteriorLabelModelPosition.NORTH),
    );

    // Creates the edge pop-up for the edge pop-up template with a suitable label model parameter
    // We use the EdgePathLabelModel for the edge pop-up
    const edgeLabelModel = new EdgePathLabelModel({ autoRotation: false });

    // Creates the pop-up for the edge pop-up template
    const edgePopup = new HTMLPopupSupport(
      this.graphComponent,
      edgePopupContent,
      edgeLabelModel.createDefaultParameter(),
    );

    // The following works with both GraphEditorInputMode and GraphViewerInputMode
    const { inputMode } = this.graphComponent;

    // The pop-up is shown for the currentItem thus nodes and edges should be focusable
    inputMode.focusableItems = GraphItemTypes.NODE || GraphItemTypes.EDGE;

    // Register a listener that shows the pop-up for the currentItem
    this.graphComponent.addCurrentItemChangedListener(() => {
      const item = this.graphComponent.currentItem;
      if (item instanceof INode) {
        this.currentNode = item.tag;
        // update data in node pop-up
        GraphClass.updateNodePopupContent(nodePopup, item);
        // open node pop-up and hide edge pop-up
        nodePopup.currentItem = item;
        edgePopup.currentItem = null;
      } else if (item instanceof IEdge) {
        // update data in edge pop-up
        GraphClass.updateEdgePopupContent(edgePopup, item);
        // open edge pop-up and node edge pop-up
        edgePopup.currentItem = item;
        nodePopup.currentItem = null;
      } else {
        nodePopup.currentItem = null;
        edgePopup.currentItem = null;
      }
      callback(this.currentNode);
    });

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
  }

  viewerInputMode() {
    this.graphComponent.inputMode = new GraphViewerInputMode();
  }

  zoomIn() {
    ICommand.INCREASE_ZOOM.execute(null, this.graphComponent);
  }

  zoomOut() {
    ICommand.DECREASE_ZOOM.execute(null, this.graphComponent);
  }

  fitContent() {
    ICommand.FIT_CONTENT.execute(null, this.graphComponent);
  }

  colorEdges() {
    const { edges } = this.graphComponent.graph;
    edges.forEach((edge) => {
      if (edge.tag === '-') {
        this.graphComponent.graphModelManager.graph.setStyle(
          edge,
          this.edgeStyle(this.startFinishColor),
        );
      } else if (edge.tag === '-1') {
        this.graphComponent.graphModelManager.graph.setStyle(
          edge,
          this.edgeStyle(this.errorColor),
        );
      } else {
        this.graphComponent.graphModelManager.graph.setStyle(
          edge,
          this.edgeStyle(this.colors[edge.tag % this.colors.length]),
        );
      }
    });
  }

  generateNodesEdges(dataRest, callback) {
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
  }

  applyGraphBuilder() {
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
        if (nodeDataItem.node.length > 10 && nodeDataItem.node.split(' ').length - 1 >= 1) {
          return nodeDataItem.node.replace(' ', '\n');
        }
        return nodeDataItem.node;
      },
    );
    nodeNameCreator.defaults.layoutParameter = ExteriorLabelModel.NORTH_EAST;

    // label label для nodes

    /*
    * TODO: У нода нет параметра лейбл, так что  свойство всегда true,
    *   а данная строка всегда возвращает undefined
    */

    const nodeLabelCreator = nodesSource.nodeCreator.createLabelBinding(
      (nodeDataItem) => nodeDataItem.label,
    );

    nodeLabelCreator.defaults.layoutParameter = ExteriorLabelModel.EAST;

    // генерация edges
    const edgesSource = graphBuilder.createEdgesSource({
      data: this.edgesSource, // .slice(0,10),
      sourceId: 'fromNode',
      targetId: 'toNode',
      tag: (item) => item.color,
    });

    edgesSource.edgeCreator.createLabelBinding((edgeDataItem) => {
      if (edgeDataItem.label !== '-') {
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
    });
    layout.nodeToNodeDistance = 301;
    layout.minimumLayerDistance = 201;

    // применяем layout
    this.graphComponent.graph.applyLayout(
      layout,
      layoutData,
      true,
      true,
      false,
      true,
      true,
      true,
    );
    this.graphComponent.fitGraphBounds();
  }

  colorFont() {
    const { nodes } = this.graphComponent.graph;
    nodes.forEach((node) => {
      // node.labels.elementAt(0) -- label который name
      this.graphComponent.graphModelManager.graph.setStyle(
        node.labels.elementAt(0),
        this.labelStyle(true),
      );
      // node.labels.elementAt(1) -- label который label
      this.graphComponent.graphModelManager.graph.setStyle(
        node.labels.elementAt(1),
        this.labelStyle(false),
      );
    });

    const { edges } = this.graphComponent.graph;
    edges.forEach((edge) => {
      this.graphComponent.graphModelManager.graph.setStyle(
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
        this.graphComponent.graphModelManager.graph.setStyle(
          node,
          GraphClass.nodeStyle(this.startFinishColor),
        );
      } else if (node.tag.node_color === '-1') {
        this.graphComponent.graphModelManager.graph.setStyle(
          node,
          GraphClass.nodeStyle(this.errorColor),
        );
      } else {
        this.graphComponent.graphModelManager.graph.setStyle(
          node,
          GraphClass.nodeStyle(
            this.colors[node.tag.node_color - 1]
            || this.startFinishColor,
          ),
        );
      }
    });
  }

  initializeDefault({ nodePopupContent, edgePopupContent, callback }) {
    this.initializeDefaultStyles();
    this.initializeTooltips();
    this.initializePopups({
      nodePopupContent,
      edgePopupContent,
      callback,
    });
  }

  reDrawNodesEdges(data, callback) {
    this.generateNodesEdges(data, callback);
    this.applyGraphBuilder();
    this.colorFont();
    this.colorNodes();
    this.colorEdges();
  }
}

export default GraphClass;
