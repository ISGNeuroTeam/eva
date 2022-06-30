// eslint-disable-next-line max-classes-per-file
import yfiles, {
  GraphComponent,
  IEdge,
  ILabel,
  IListEnumerable,
  INode,
  Insets,
  IPort,
  ListEnumerable,
  Point,
  Rect,
  SimpleNode,
  SvgExport,
  YVector,
  VoidNodeStyle,
} from 'yfiles';

export class DragAndDropPanel {
  /**
   * Create a new style panel in the given element.
   * @param {!HTMLElement} div The element that will display the palette items.
   */
  constructor(div) {
    this.div = div;

    this.clearDnDPanel();

    this.graphComponent = new GraphComponent();

    // The desired maximum width of each item. This value is used to decide whether or not a
    // visualization must be scaled down.
    this.maxItemWidth = 150;

    // Whether the labels of the DnD node
    // visual should be transferred to the created node or discarded.
    this.copyNodeLabels = true;

    // A callback that is called then the user presses the mouse button on an item.
    // It should start the actual drag and drop operation.
    this.beginDragCallback = null;
  }

  get getMaxItemWidth() {
    return this.maxItemWidth;
  }

  get getGraphComponent() {
    return this.graphComponent;
  }

  clearDnDPanel() {
    this.div.querySelectorAll('.dndPanelItem__group')
      .forEach((group) => {
        group.querySelector('.dndPanelItem__group-items').innerHTML = '';
      });
  }

  /**
   * Adds the items provided by the given factory to this palette.
   * This method delegates the creation of the visualization of each node
   * to createNodeVisual.
   * @param {?function} itemFactory
   */
  populatePanel(itemFactory) {
    if (!itemFactory) {
      return;
    }

    // Create the nodes that specify the visualizations for the panel.
    const items = itemFactory || [];

    // Convert the nodes into plain visualizations
    this.graphComponent.graph.clear();

    items.forEach((item) => {
      const modelItem = item instanceof INode || item instanceof IEdge ? item : item.element;
      const visual = modelItem instanceof INode
        ? this.createNodeVisual(modelItem)
        : this.createEdgeVisual(modelItem);
      this.addPointerDownListener(modelItem, visual, this.beginDragCallback);
      const images = visual.querySelectorAll('image');
      if (images?.length > 0) {
        images.forEach((image) => {
          image.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        });
      }
      this.div
        .querySelector(`.dndPanelItem__group--${item.elementType}`)
        .querySelector('.dndPanelItem__group-items')
        .appendChild(visual);
    });
  }

  /**
   * Creates an element that contains the visualization of the given node.
   * This method is used by populatePanel to create the visualization
   * for each node provided by the factory.
   * @param {!Item.<INode>} original
   * @returns {!HTMLDivElement}
   */
  createNodeVisual(original) {
    const { graph } = this.graphComponent;
    graph.clear();

    const originalNode = original instanceof INode
      ? original
      : original.element;
    const node = graph.createNode(
      originalNode.layout,
      originalNode.style,
      originalNode.tag,
    );
    if (originalNode.tag.isTriangle) {
      // graph.setStyle(node, );
    }
    originalNode.labels.forEach((label) => {
      graph.addLabel(
        node,
        label.text,
        label.layoutParameter,
        label.style,
        label.preferredSize,
        label.tag,
      );
    });
    originalNode.ports.forEach((port) => {
      graph.addPort(node, port.locationParameter, port.style, port.tag);
    });
    this.updateViewport(this.graphComponent);
    return this.exportAndWrap(
      original?.tag || null,
      original instanceof INode ? undefined : original.elementType,
    );
  }

  /**
   * Creates an element that contains the visualization of the given edge.
   * @param {!Item.<IEdge>} original
   * @returns {!HTMLDivElement}
   */
  createEdgeVisual(original) {
    const { graph } = this.graphComponent;
    graph.clear();

    const originalEdge = original instanceof IEdge ? original : original.element;

    const n1 = graph.createNode(new Rect(0, 10, 0, 0), VoidNodeStyle.INSTANCE);
    const n2 = graph.createNode(new Rect(150, 75, 0, 0), VoidNodeStyle.INSTANCE);
    const edge = graph.createEdge(n1, n2, originalEdge.style);
    graph.addBend(edge, new Point(75, 10));
    graph.addBend(edge, new Point(75, 75));

    this.updateViewport(this.graphComponent);

    // provide some more insets to account for the arrow heads
    this.graphComponent.updateContentRect(new Insets(5));

    return this.exportAndWrap(
      this.graphComponent,
      original instanceof IEdge ? undefined : original.elementType,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  updateViewport() {
    const { graph } = this.graphComponent;
    let viewport = Rect.EMPTY;
    graph.nodes.forEach((node) => {
      viewport = Rect.add(viewport, node.layout.toRect());
      node.labels.forEach((label) => {
        viewport = Rect.add(viewport, label.layout.bounds);
      });
    });
    graph.edges.forEach((edge) => {
      viewport = viewport.add(edge.sourcePort.location);
      viewport = viewport.add(edge.targetPort.location);
      edge.bends.forEach((bend) => {
        viewport = viewport.add(bend.location.toPoint());
      });
    });
    viewport = viewport.getEnlarged(5);
    this.graphComponent.contentRect = viewport;
    this.graphComponent.zoomTo(viewport);
  }

  exportAndWrap(nodeTag, elementType) {
    const exporter = new SvgExport({
      worldBounds: this.graphComponent.contentRect,
      margins: 2,
    });

    exporter.scale = exporter.calculateScaleForWidth(
      Math.min(this.maxItemWidth, this.graphComponent.contentRect.width),
    );
    const visual = exporter.exportSvg(this.graphComponent);

    // Firefox does not display the SVG correctly because of the clip - so we remove it.
    visual.removeAttribute('clip-path');

    const div = document.createElement('div');
    div.setAttribute('class', 'dndPanelItem');
    div.appendChild(visual);
    div.style.setProperty('width', visual.getAttribute('width'));
    div.style.setProperty('height', visual.getAttribute('height'));
    div.style.setProperty('touch-action', 'none');
    try {
      div.style.setProperty('cursor', 'grab', '');
    } catch (e) {
      /* IE9 doesn't support grab cursor */
    }
    if (elementType) {
      div.title = elementType;
    }
    return div;
  }

  /**
   * Adds a mousedown listener to the given element that starts the drag operation.
   * @param {!(INode|IEdge)} item
   * @param {!HTMLElement} element
   * @param {?function} callback
   */
  addPointerDownListener(item, element, callback) {
    if (!callback) {
      return;
    }

    // the actual drag operation
    const doDragOperation = () => {
      // Ensure that the following code still works, even when the view-table module isn't loaded
      const { IStripe } = yfiles.graph;
      if (IStripe && item.tag instanceof IStripe) {
        // If the dummy node has a stripe as its tag, we use the stripe directly
        // This allows StripeDropInputMode to take over
        callback(element, item.tag);
      } else if (item.tag instanceof ILabel || item.tag instanceof IPort) {
        callback(element, item.tag);
      } else if (item instanceof IEdge) {
        callback(element, item);
      } else if (item instanceof INode) {
        // Otherwise, we just use the node itself and let (hopefully) NodeDropInputMode take over
        const simpleNode = new SimpleNode();
        simpleNode.layout = item.layout;
        simpleNode.style = item.style.clone();
        simpleNode.tag = item.tag;
        simpleNode.labels = this.copyNodeLabels ? item.labels : IListEnumerable.EMPTY;
        if (item.ports.size > 0) {
          simpleNode.ports = new ListEnumerable(item.ports);
        }
        callback(element, simpleNode);
      }
    };

    element.addEventListener(
      'mousedown',
      (evt) => {
        if (evt.button !== 0) {
          return;
        }
        doDragOperation();
        evt.preventDefault();
      },
      false,
    );

    const touchStartListener = (evt) => {
      doDragOperation();
      evt.preventDefault();
    };

    if (window.PointerEvent !== undefined) {
      element.addEventListener(
        'pointerdown',
        (evt) => {
          if (evt.pointerType === 'touch' || evt.pointerType === 'pen') {
            touchStartListener(evt);
          }
        },
        true,
      );
    } else if (window.MSPointerEvent !== undefined) {
      element.addEventListener(
        'MSPointerDown',
        (evt) => {
          if (
            evt.pointerType === evt.MSPOINTER_TYPE_TOUCH
            || evt.pointerType === evt.MSPOINTER_TYPE_PEN
          ) {
            touchStartListener(evt);
          }
        },
        true,
      );
    } else {
      element.addEventListener(
        'touchstart',
        touchStartListener,
        false,
      );
    }
  }
}

export class DragAndDropPanelItem {
  constructor(element, tooltip, elementType) {
    this.tooltip = tooltip;
    this.elementType = elementType;
    this.element = element;
  }
}
