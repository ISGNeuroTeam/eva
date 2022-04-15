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
  BezierEdgeStyle,
  TimeSpan,
  Key,
  ModifierKeys,
  SimpleLabel,
  Size,
} from 'yfiles';
import HTMLPopupSupport from './HTMLPopupSupport';

class GraphClass {
  static nodeStyle(color) {
    return new ShapeNodeStyle({
      fill: color,
      shape: 'ELLIPSE',
      stroke: color,
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

  options = {
    labelStyleList: {}, // варианты labelStyle
    edgeStyleList: {},
  }

  constructor({
    elem,
    colors,
  }) {
    this.graphComponent = new GraphComponent(elem);
    this.colors = colors;
  }

  get getGraph() {
    return this.graphComponent;
  }

  get edgeStyleList() {
    return this.options.edgeStyleList;
  }

  set edgeStyleList(value) {
    this.options.edgeStyleList = value;
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

  edgeStyle(color) {
    if (color === undefined) {
      [color] = this.colors;
    }
    const key = `edgeStyle_${color}`;
    if (!this.edgeStyleList[key]) {
      this.edgeStyleList[key] = new PolylineEdgeStyle({
        stroke: `6px ${color}`,
        targetArrow: new Arrow({
          fill: color,
          scale: 5,
          type: 'SHORT',
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

  initializePopups(nodePopupElem) {
    // Creates a label model parameter that is used to position the node pop-up
    const nodeLabelModel = new ExteriorLabelModel({ insets: 10 });

    // Creates the pop-up for the node pop-up template
    const nodePopup = new HTMLPopupSupport(
      this.graphComponent,
      nodePopupElem,
      nodeLabelModel.createParameter(ExteriorLabelModelPosition.NORTH),
    );

    // Creates the edge pop-up for the edge pop-up template with a suitable label model parameter
    // We use the EdgePathLabelModel for the edge pop-up
    const edgeLabelModel = new EdgePathLabelModel({ autoRotation: false });

    // Creates the pop-up for the edge pop-up template
    const edgePopup = new HTMLPopupSupport(
      this.graphComponent,
      nodePopupElem,
      edgeLabelModel.createDefaultParameter(),
    );

    // The following works with both GraphEditorInputMode and GraphViewerInputMode
    const { inputMode } = this.graphComponent;

    // The pop-up is shown for the currentItem thus nodes and edges should be focusable
    inputMode.focusableItems = GraphItemTypes.NODE || GraphItemTypes.EDGE;

    // Register a listener that shows the pop-up for the currentItem
    // TODO: Разобраться с ивентом
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
    });

    // On press of the ESCAPE key, set currentItem to <code>null</code> to hide the pop-ups
    inputMode.keyboardInputMode.addKeyBinding(
      Key.ESCAPE,
      ModifierKeys.NONE,
      (command, parameter, source) => {
        this.currentNode = null;
        source.currentItem = null;
        return true;
      },
    );
  }
}

export default GraphClass;
