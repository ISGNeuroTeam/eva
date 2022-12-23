import {
  INode,
  IEdge,
  ILabel,
  IPort,
  IPortLocationModelParameter,
} from 'yfiles';

class SchemeUpdater {
  constructor(graph, saveToStoreCallback) {
    this.graph = graph;
    this.saveToStoreCallback = saveToStoreCallback;
    this.nodes = this.graph.nodes.toArray();
    this.edges = this.graph.edges.toArray();
    this.ports = this.graph.ports.toArray();
    this.labels = this.graph.labels.toArray();
  }

  get allElementsOnGraph() {
    return [...this.nodes, ...this.edges, ...this.ports, ...this.labels];
  }

  save() {
    const result = [];
    this.allElementsOnGraph.forEach((element) => {
      if (element instanceof INode) {
        result.push({
          type: SchemeUpdater.getNodeType(element),
          data: {
            ports: element.ports,
            tag: SchemeUpdater.getNodeTag(element),
          },
          layout: SchemeUpdater.getLayout(element.layout),
        });
      }
      if (element instanceof IEdge) {
        result.push({
          type: 'edge',
          data: SchemeUpdater.getEdgeData(element),
        });
      }
      if (element instanceof IPort) {
        result.push({
          type: 'port',
          data: SchemeUpdater.getPortData(element),
        });
      }
    });
    return result;
  }

  static getPortData(port) {
    // TODO: WIP
    return {
      owner: port.owner.tag.nodeId,
      port,
    };
  }

  static getEdgeData(edge) {
    const {
      tag,
      bends,
      ports,
      labels,
      sourceNode,
      sourcePort,
      targetNode,
      targetPort,
    } = edge;
    return {
      tag,
      bends,
      ports,
      labels,
      source: {
        node: sourceNode,
        port: sourcePort,
      },
      target: {
        node: targetNode,
        port: targetPort,
      },
    };
  }

  static getNodeType(node) {
    return SchemeUpdater.getNodeTag(node)?.dataType || SchemeUpdater.getNodeTag(node);
  }

  static getNodeTag(node) {
    if (typeof node.tag === 'string') {
      return {
        dataType: 'invisible-node',
      };
    }
    if (node?.tag?.templateType) {
      return {
        ...node.tag,
        dataType: `data-node-${node.tag?.dataType}`,
      };
    }
    return node.tag;
  }

  static getLayout(nodeLayout) {
    return {
      x: nodeLayout.x,
      y: nodeLayout.y,
      width: nodeLayout.width,
      height: nodeLayout.height,
    };
  }
}

export default SchemeUpdater;
