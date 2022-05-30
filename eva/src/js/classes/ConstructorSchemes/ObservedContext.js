class ObservedContext {
  /**
   * @param {!INode} node
   * @param {!IRenderContext} renderContext
   */
  constructor(node, renderContext) {
    this.observed = {};
    this.node = node;
    this.graphComponent = renderContext.canvasComponent;
    this.defsSupport = renderContext.svgDefsManager;
    this.contextZoom = renderContext.zoom;
    this.reset();
  }

  /**
   * @param {!IRenderContext} renderContext
   */
  update(renderContext) {
    this.defsSupport = renderContext.svgDefsManager;
    this.contextZoom = renderContext.zoom;
  }

  /**
   * Resets the context object to an empty object if none of the properties is used.
   * @returns {?Object}
   */
  reset() {
    const oldState = this.observed;
    this.observed = {};
    if (
      oldState
      && ['tag', 'layout', 'zoom', 'selected', 'highlighted', 'focused'].some((name) => Object.prototype
        .hasOwnProperty.call(oldState, name))
    ) {
      return oldState;
    }
    return null;
  }

  /**
   * Checks the current state for changes and returns the differences to the old state.
   * @param {!State} oldState
   * @returns {!object}
   */
  checkModification(oldState) {
    const delta = {};
    let change = false;
    if (Object.prototype.hasOwnProperty.call(oldState, 'layout')) {
      const { layout } = this.node;
      const newValue = {
        x: layout.x,
        y: layout.y,
        width: layout.width,
        height: layout.height,
      };
      const oldLayout = oldState.layout;
      if (
        newValue.x !== oldLayout.x
        || newValue.y !== oldLayout.y
        || newValue.width !== oldLayout.width
        || newValue.height !== oldLayout.height
      ) {
        delta.layout = newValue;
        change = true;
      }
    }
    if (Object.prototype.hasOwnProperty.call(oldState, 'zoom')) {
      const newValue = this.contextZoom;
      if (newValue !== oldState.zoom) {
        delta.zoom = newValue;
        change = true;
      }
    }
    if (Object.prototype.hasOwnProperty.call(oldState, 'tag')) {
      const newValue = this.node.tag;
      if (newValue !== oldState.tag) {
        delta.tag = newValue;
        change = true;
      }
    }
    if (Object.prototype.hasOwnProperty.call(oldState, 'selected')) {
      const newValue = this.graphComponent.selection.selectedNodes.isSelected(this.node);
      if (newValue !== oldState.selected) {
        delta.selected = newValue;
        change = true;
      }
    }
    if (Object.prototype.hasOwnProperty.call(oldState, 'highlighted')) {
      const newValue = this.graphComponent.highlightIndicatorManager.selectionModel.isSelected(
        this.node,
      );
      if (newValue !== oldState.highlighted) {
        delta.highlighted = newValue;
        change = true;
      }
    }
    if (Object.prototype.hasOwnProperty.call(oldState, 'focused')) {
      const newValue = this.graphComponent.focusIndicatorManager.focusedItem === this.node;
      if (newValue !== oldState.focused) {
        delta.focused = newValue;
        change = true;
      }
    }
    return {
      change,
      delta,
    };
  }

  /**
   * Returns the layout.
   * @type {!NodeLayout}
   */
  get layout() {
    if (Object.prototype.hasOwnProperty.call(this.observed, 'layout')) {
      return this.observed.layout;
    }
    const { layout } = this.node;
    this.observed.layout = {
      x: layout.x,
      y: layout.y,
      height: layout.height,
      width: layout.width,
    };
    return this.observed.layout;
  }

  /**
   * Returns the zoom level.
   * @type {number}
   */
  get zoom() {
    if (Object.prototype.hasOwnProperty.call(this.observed, 'zoom')) {
      return this.observed.zoom;
    }
    this.observed.zoom = this.contextZoom;
    return this.observed.zoom;
  }

  /**
   * Returns the tag.
   * @type {!object}
   */
  get tag() {
    if (Object.prototype.hasOwnProperty.call(this.observed, 'tag')) {
      return this.observed.tag;
    }
    this.observed.tag = this.node.tag;
    return this.observed.tag;
  }

  /**
   * Returns the selected state.
   * @type {boolean}
   */
  get selected() {
    if (Object.prototype.hasOwnProperty.call(this.observed, 'selected')) {
      return this.observed.selected;
    }
    this.observed.selected = this.graphComponent.selection.selectedNodes.isSelected(
      this.node,
    );
    return this.observed.selected;
  }

  /**
   * Returns the highlighted state.
   * @type {boolean}
   */
  get highlighted() {
    if (Object.prototype.hasOwnProperty.call(this.observed, 'highlighted')) {
      return this.observed.highlighted;
    }
    this.observed.highlighted = this.graphComponent
      .highlightIndicatorManager
      .selectionModel
      .isSelected(this.node);
    return this.observed.highlighted;
  }

  /**
   * Returns the focused state.
   * @type {boolean}
   */
  get focused() {
    if (Object.prototype.hasOwnProperty.call(this.observed, 'focused')) {
      return this.observed.focused;
    }
    this.observed.focused = this.graphComponent.focusIndicatorManager.focusedItem === this.node;
    return this.observed.focused;
  }

  /**
   * Generates an id for use in SVG defs elements that is unique for the current rendering context.
   * @returns {!string}
   */
  generateDefsId() {
    return this.defsSupport.generateUniqueDefsId();
  }
}

export default ObservedContext;
