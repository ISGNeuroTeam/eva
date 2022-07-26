import {
  SimpleLabel, Size, Point, IEdge,
} from 'yfiles';

class HTMLPopupSupport {
  /**
   * Initializes a new HTMLPopupSupport instance for the given graph component, pop-up container
   * div, and pop-up placement parameter.
   * @param {!GraphComponent} graphComponent The GraphComponent
   * that displays the nodes and edges for which pop-ups
   * will be shown.
   * @param {!HTMLElement} div The HTMLDivElement that is
   * used as parent element for the pop-up element.
   * @param {!ILabelModelParameter} labelModelParameter The placement
   * parameter that determines the pop-up location.
   */
  constructor(graphComponent, div, labelModelParameter) {
    this.labelModelParameter = labelModelParameter;
    this.div = div;
    this.graphComponent = graphComponent;
    // eslint-disable-next-line no-underscore-dangle
    this._currentItem = null;
    this.dirty = false;
    // make the popup invisible
    div.style.opacity = '0';
    div.style.display = 'none';

    this.registerListeners();
  }

  /**
   * Gets the node or edge to display information for.
   * @type {?(IEdge|INode)}
   */
  get currentItem() {
    // eslint-disable-next-line no-underscore-dangle
    return this._currentItem;
  }

  /**
   * Sets the node or edge to display information for.
   * Setting this property to a value other than null shows the pop-up.
   * Setting the property to null hides the pop-up.
   * @type {?(IEdge|INode)}
   */
  set currentItem(value) {
    // eslint-disable-next-line no-underscore-dangle
    this._currentItem = value;
    if (value) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Registers viewport, node bounds changes, and visual tree listeners to the support's associated
   * graph component.
   */
  registerListeners() {
    // Adds listener for viewport changes
    this.graphComponent.addViewportChangedListener(() => {
      if (this.currentItem) {
        this.dirty = true;
      }
    });

    // Adds listeners for node bounds changes
    this.graphComponent.graph.addNodeLayoutChangedListener((node) => {
      const item = this.currentItem;
      if (
        item
        && (item === node || HTMLPopupSupport.isEdgeConnectedTo(item, node))
      ) {
        this.dirty = true;
      }
    });

    // Adds listener for updates of the visual tree
    this.graphComponent.addUpdatedVisualListener(() => {
      if (this.currentItem && this.dirty) {
        this.dirty = false;
        // this.updateLocation();
      }
    });
  }

  /**
   * Makes this pop-up visible.
   */
  show() {
    this.div.style.display = 'block';
    setTimeout(() => {
      this.div.style.opacity = '1';
    }, 0);
    // this.updateLocation();
  }

  /**
   * Hides this pop-up.
   */
  hide() {
    const parent = this.div.parentNode;
    const popupClone = this.div.cloneNode(true);
    popupClone.setAttribute(
      'class',
      `${popupClone.getAttribute('class')} popupContentClone`,
    );
    parent.appendChild(popupClone);
    // fade the clone out, then remove it from the DOM. Both actions need to be timed.
    setTimeout(() => {
      popupClone.setAttribute(
        'style',
        `${popupClone.getAttribute('style')} opacity: 0;`,
      );
      setTimeout(() => {
        parent.removeChild(popupClone);
      }, 300);
    }, 0);
    this.div.style.opacity = '0';
    this.div.style.display = 'none';
  }

  /**
   * Changes the location of this pop-up to the location calculated by the
   * {@link HTMLPopupSupport#labelModelParameter}.
   * Currently, this implementation does not support rotated pop-ups.
   */
  updateLocation() {
    if (!this.currentItem && !this.labelModelParameter) {
      return;
    }
    const width = this.div.clientWidth;
    const height = this.div.clientHeight;
    const { zoom } = this.graphComponent;

    const dummyLabel = new SimpleLabel(
      this.currentItem,
      '',
      this.labelModelParameter,
    );
    if (this.labelModelParameter.supports(dummyLabel)) {
      dummyLabel.preferredSize = new Size(width / zoom, height / zoom);
      const newLayout = this.labelModelParameter.model.getGeometry(
        dummyLabel,
        this.labelModelParameter,
      );
      this.setLocation(
        newLayout.anchorX,
        newLayout.anchorY - (height + 10) / zoom,
      );
    }
  }

  /**
   * Sets the location of this pop-up to the given world coordinates.
   * @param {number} x The target x-coordinate of the pop-up.
   * @param {number} y The target y-coordinate of the pop-up.
   */
  setLocation(x, y) {
    let indent = 20;
    const { zoom } = this.graphComponent;
    indent /= zoom;
    // Calculate the view coordinates since we have
    // to place the div in the regular HTML coordinate space
    const viewPoint = this.graphComponent.toViewCoordinates(new Point(x + indent, y));
    this.div.style.setProperty(
      'transform',
      `translate(${viewPoint.x}px, ${viewPoint.y}px)`,
    );
  }

  /**
   * Determines if the given item is an IEdge connected to the given node.
   * @param {!IModelItem} item
   * @param {!INode} node
   * @returns {boolean}
   */
  static isEdgeConnectedTo(item, node) {
    return (
      item instanceof IEdge
      && (item.sourcePort.owner === node || item.targetPort.owner === node)
    );
  }
}

export default HTMLPopupSupport;
