import {
  INode,
  IEdge,
  IPort,
} from 'yfiles';
import Utils from './Utils.js';
import elementTemplates from './elementTemplates.js';

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
        result.push(SchemeUpdater.getNode(element));
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

  static getNode(element) {
    if (element.tag.dataType === 'image-node') {
      return {
        tag: element.tag,
        // TODO: Заменить на регулярку
        style: element.style.image.replace('/svg/', '').replace('.svg', ''),
        layout: SchemeUpdater.getLayout(element.layout),
      };
    }
    return {
      tag: SchemeUpdater.getDataNodeTag(element),
      layout: SchemeUpdater.getLayout(element.layout),
    };
  }

  static getDataNodeTag(element) {
    if (typeof elementTemplates[element.tag.dataType] === 'undefined') {
      return [];
    }
    // TODO: Скорее всего надо переписать на reduce
    const result = {};
    Object.keys(elementTemplates[element.tag.dataType].dataRest).forEach((field) => {
      result[field] = element.tag[field];
    });
    return result;
  }

  static getPortData(port) {
    return {
      owner: port.owner.tag.nodeId,
      tag: port?.tag?.portType,
      position: {
        x: port.dynamicLocation.x,
        y: port.dynamicLocation.y,
      },
    };
  }

  static getEdgeStyle({
    smoothingLength,
    targetArrow,
    stroke,
  }) {
    return {
      strokeColor: stroke?.fill?.color
        ? Utils.colorToString(stroke.fill.color)
        : null,
      strokeSize: stroke.thickness,
      targetArrowColor: targetArrow?.stroke?.fill?.color
        ? Utils.colorToString(targetArrow.stroke.fill.color)
        : null,
      targetArrowType: targetArrow?.type || '',
      smoothingLength,
    };
  }

  static getEdgeData(edge) {
    const {
      tag,
      sourceNode,
      sourcePort,
      targetNode,
      targetPort,
      style,
    } = edge;
    return {
      tag,
      bends: SchemeUpdater.getBends(edge),
      labels: SchemeUpdater.getEdgeLabels(edge),
      style: SchemeUpdater.getEdgeStyle(style),
      source: {
        node: sourceNode.tag.nodeId,
        port: {
          location: {
            x: sourcePort.dynamicLocation.x,
            y: sourcePort.dynamicLocation.y,
          },
          type: sourcePort?.tag?.portType || '',
        },
      },
      target: {
        node: targetNode.tag.nodeId,
        port: {
          location: {
            x: targetPort.dynamicLocation.x,
            y: targetPort.dynamicLocation.y,
          },
          type: targetPort?.tag?.portType || '',
        },
      },
    };
  }

  static getBends(edge) {
    if (edge?.bends.toArray()?.length > 0) {
      return edge?.bends.toArray().map((bend) => ({ x: bend.location.x, y: bend.location.y }));
    }
    return [];
  }

  static getEdgeLabels(edge) {
    if (edge.labels.toArray()?.length > 0) {
      return edge.labels.toArray();
    }
    return [];
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
        dataType: node.tag?.dataType,
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
