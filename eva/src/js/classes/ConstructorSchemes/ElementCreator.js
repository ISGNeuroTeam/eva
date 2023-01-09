import elementTemplates from './elementTemplates.js';

class ElementCreator {
  constructor({
    graph,
  }) {
    this.graph = graph;
    this.elementTemplates = elementTemplates;
  }

  createNode({
    type,
    data,
    layout,
    style,
  }) {
    const createdNode = null;
    // if () {
    //
    // }
    return createdNode;
  }

  createEdge() {}
}

export default ElementCreator;
