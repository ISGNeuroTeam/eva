import {
  INode,
  IEdge,
  IPort,
  ILabel,
} from 'yfiles';
import Utils from './Utils.js';
import ElementCreator from './ElementCreator.js';

class SchemeUpdater {
  constructor({ graph, elementsFromStore, updateStoreCallback }) {
    this.graph = graph;
    this.updateStoreCallback = updateStoreCallback;
    this.elementsFromStore = structuredClone(elementsFromStore);
    this.nodes = this.graph.nodes.toArray();
    this.edges = this.graph.edges.toArray();
    this.ports = this.graph.ports.toArray();
    this.labels = this.graph.labels.toArray();
  }

  get allElementsOnGraph() {
    return [...this.nodes, ...this.edges, ...this.ports, ...this.labels];
  }

  save() {
    return new Promise((resolve, reject) => {
      try {
        const result = [];
        this.allElementsOnGraph.forEach((element) => {
          if (element instanceof INode && element.tag.dataType !== 'invisible') {
            result.push({
              type: 'node',
              data: SchemeUpdater.getNode(element),
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
          if (element instanceof ILabel) {
            result.push({
              type: 'label',
              data: SchemeUpdater.getLabelData(element),
            });
          }
        });
        resolve(structuredClone(result));
      } catch (e) {
        reject(e);
      }
    });
  }

  load() {
    return new Promise((resolve, reject) => {
      try {
        const elementCreator = new ElementCreator({
          graph: this.graph,
          elements: structuredClone(this.elementsFromStore),
        });
        elementCreator.buildGraph().then(() => {
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  static getNode(element) {
    if (element.tag.dataType === 'image-node') {
      if (element.tag?.fromOtl) {
        const filteredObjectFromOtl = {};
        Object.keys(element.tag.fromOtl).forEach((key) => {
          if (key !== 'icon') {
            filteredObjectFromOtl[key] = element.tag.fromOtl[key];
          }
        });
        return {
          tag: {
            ...element.tag,
            fromOtl: {
              ...filteredObjectFromOtl,
            },
            nodeId: element.hashCode(),
          },
          icon: element.style.image.match(/\/svg\/([\s\S]+?)\.svg/)[1],
          layout: SchemeUpdater.getLayout(element.layout),
        };
      }
      return {
        tag: {
          ...element.tag,
          nodeId: element.hashCode(),
        },
        icon: element.style.image.match(/\/svg\/([\s\S]+?)\.svg/)[1],
        layout: SchemeUpdater.getLayout(element.layout),
      };
    }
    if (element.tag[0] === 'i') {
      return {
        tag: {
          dataType: 'invisible',
          nodeId: element.hashCode(),
        },
        layout: SchemeUpdater.getLayout(element.layout),
      };
    }
    return {
      tag: {
        ...element.tag,
        nodeId: element.hashCode(),
      },
      layout: SchemeUpdater.getLayout(element.layout),
    };
  }

  static getLabelData(label) {
    return {
      tag: {
        id: label.hashCode(),
        font: label.style.font.fontFamily.replace('\'', ''),
        fontSize: label.style.textSize,
        textColor: Utils.generateColor(label.style.textFill.color),
      },
      text: label?.text || '',
      position: {
        x: label.layout.orientedRectangleCenter.x,
        y: label.layout.orientedRectangleCenter.y,
      },
    };
  }

  static getPortData(port) {
    return {
      owner: {
        type: SchemeUpdater.getPortOwnerType(port.owner),
        id: port?.owner?.hashCode(),
      },
      tag: {
        type: port?.tag?.portType || 'edge-to-edge',
        portId: port?.hashCode(),
      },
      position: SchemeUpdater.getPortLocation(port),
    };
  }

  static getPortOwnerType(owner) {
    if (owner instanceof INode) {
      return 'node';
    }
    if (owner instanceof IEdge) {
      return 'edge';
    }
    return '';
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
      tag: {
        ...tag,
        edgeId: edge.hashCode(),
      },
      bends: SchemeUpdater.getBends(edge),
      labels: SchemeUpdater.getEdgeLabels(edge),
      style: SchemeUpdater.getEdgeStyle(style),
      source: {
        node: sourceNode?.tag?.nodeId,
        port: {
          id: sourcePort?.hashCode(),
          location: SchemeUpdater.getPortLocation(sourcePort),
        },
      },
      target: {
        node: targetNode?.tag?.nodeId,
        port: {
          id: targetPort?.hashCode(),
          location: SchemeUpdater.getPortLocation(targetPort),
        },
      },
    };
  }

  static getPortLocation(port) {
    return {
      x: port.dynamicLocation.x,
      y: port.dynamicLocation.y,
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
