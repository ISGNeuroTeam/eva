import {
  Point,
  PolylineEdgeStyle,
  Rect,
  ShapeNodeStyle,
  DefaultLabelStyle,
  FreeNodePortLocationModel,
  ImageNodeStyle,
} from 'yfiles';
import ElementTemplates from './elementTemplates.js';
import VuejsNodeStyle from '@/js/classes/ConstructorSchemes/VueNodeStyle';
import GenerateIcons from '@/js/classes/ConstructorSchemes/GenerateIcons';
import Utils from '@/js/classes/ConstructorSchemes/Utils';

class ElementCreator {
  constructor({
    graph,
    elements,
    defaultEdgeStyles,
  }) {
    this.graph = graph;
    this.elements = elements;
    this.elementTemplates = ElementTemplates;
    this.defaultEdgeStyles = defaultEdgeStyles;
  }

  buildGraph() {
    return new Promise((resolve, reject) => {
      try {
        this.graph.clear();
        const { graph } = this;
        const nodeList = ElementCreator.getElementsByType(
          this.elements,
          'node',
        );
        const edgesList = ElementCreator.getElementsByType(
          this.elements,
          'edge',
        );
        const portsList = ElementCreator.getElementsByType(
          this.elements,
          'port',
        );
        const labelsList = ElementCreator.getElementsByType(
          this.elements,
          'label',
        );
        ElementCreator.createNodes({
          graph,
          nodeList,
          elementTemplates: this.elementTemplates,
          allElements: this.elements,
          portsList,
        })
          .then(() => {
            const updatedPortsList = ElementCreator.getElementsByType(
              this.elements,
              'port',
            );
            const portsFromGraph = this.graph.ports.toArray();
            return ElementCreator.createPorts({
              graph,
              portsList: updatedPortsList,
              portsFromGraph,
            });
          })
          .then(() => ElementCreator.createEdges({
            graph,
            edgesList,
          }))
          .then(() => ElementCreator.createLabels({
            graph,
            labelsList,
          }))
          .then(() => {
            resolve();
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  static createPorts({
    graph,
    portsList,
    portsFromGraph,
  }) {
    return new Promise((resolve) => {
      const filteredPorts = [];
      portsList.forEach((port) => {
        if (!portsFromGraph.some((el) => port.data.tag.portId === el.tag.portId)) {
          filteredPorts.push(port.data);
        }
      });
      filteredPorts.forEach((el) => {
        const createdNode = ElementCreator.createInvisibleNode({
          graph,
          id: el.tag.portId,
          location: el.position,
        });
        ElementCreator.createRelativePort({
          graph,
          node: createdNode,
          portId: el.tag.portId,
        });
      });
      resolve();
    });
  }

  static getElementsByType(elements, type) {
    return elements.filter((el) => el.type === type);
  }

  static getPortById({
    graph,
    portId,
  }) {
    if (graph.ports.toArray()?.length > 0 && typeof portId === 'number') {
      return graph.ports.toArray().find(({ tag }) => tag?.portId === portId);
    }
    return null;
  }

  static getTargetPort({
    graph,
    targetPortId,
  }) {
    if (graph.ports.toArray()?.length > 0) {
      return graph.ports.toArray().find(({ tag }) => tag?.portId === targetPortId);
    }
    return null;
  }

  static getSourcePort({
    graph,
    sourcePortId,
  }) {
    if (graph.ports.toArray()?.length > 0) {
      return graph.ports.toArray().find(({ tag }) => tag?.portId === sourcePortId);
    }
    return null;
  }

  static createEdges({
    graph,
    edgesList,
  }) {
    return new Promise((resolve, reject) => {
      try {
        const createdEdgesList = [];
        if (edgesList?.length > 0) {
          edgesList.forEach(({ data }) => {
            ElementCreator.createEdge({
              graph,
              edge: data,
            }).then((createdEdge) => {
              createdEdgesList.push(createdEdge);
            }).catch((e) => {
              reject(e);
            });
          });
        }
        resolve(createdEdgesList);
      } catch (e) {
        reject(e);
      }
    });
  }

  static createNodes({
    nodeList,
    graph,
    elementTemplates,
    allElements,
    portsList,
  }) {
    return new Promise((resolve, reject) => {
      const createdNodes = [];
      try {
        nodeList.forEach((element) => {
          ElementCreator.createNode({
            element: element.data,
            graph,
            elementTemplates,
            allElements,
          }).then((createdNode) => {
            ElementCreator.createPortsById({
              graph,
              element: createdNode,
              portsList,
            });
            createdNodes.push(createdNode);
          });
        });
        resolve(createdNodes);
      } catch (e) {
        reject(e);
      }
    });
  }

  static createPortsById({
    graph,
    element,
    portsList,
  }) {
    const portsFromGraph = graph.ports.toArray();
    const nodeId = element?.tag?.nodeId;
    const edgeId = element?.tag?.edgeId;
    if (portsList?.length > 0) {
      const filteredPortsList = [];
      portsList.filter(({ data }) => data
          && (data?.owner?.id === nodeId || data?.owner?.id === edgeId))
        .forEach((port) => {
          const xPos = port?.data?.position?.x;
          const yPos = port?.data?.position?.y;
          if (!portsFromGraph.some((el) => xPos === el?.location?.x && yPos === el?.location?.y)) {
            filteredPortsList.push(port);
          }
        });
      if (filteredPortsList?.length > 0) {
        filteredPortsList.forEach((port) => {
          if (nodeId) {
            ElementCreator.createPort({
              graph,
              owner: ElementCreator.getNodeById({
                graph,
                id: nodeId,
              }),
              location: port.data.position,
              tag: port.data.tag,
            });
          }
        });
      }
    }
  }

  static getNodeById({
    graph,
    id,
  }) {
    return graph.nodes.toArray().find((node) => node.tag.nodeId === id);
  }

  static createNode({
    element,
    graph,
    elementTemplates,
    allElements = [],
  }) {
    const templateList = elementTemplates.templates;
    return new Promise((resolve) => {
      let createdNode = null;
      if (element.tag.dataType === 'image-node') {
        let icon = '';
        if (element.icon.match(/\/svg\/([\s\S]+?)\.svg/)) {
          // eslint-disable-next-line prefer-destructuring
          icon = element.icon.match(/\/svg\/([\s\S]+?)\.svg/)[1];
        } else {
          icon = element.icon;
        }
        const imageNode = GenerateIcons.getIconNode({
          data: {
            ...element,
            icon,
          },
          size: element.layout,
        });
        createdNode = graph.createNodeAt({
          location: [
            element.layout.x || imageNode.layout.x,
            element.layout.y || imageNode.layout.y,
            element.layout.width || imageNode.layout.width,
            element.layout.height || imageNode.layout.height,
          ],
          style: imageNode.style.clone(),
          tag: {
            ...imageNode.tag,
            ...element.tag,
          },
        });
      } else if (element.tag?.dataType === 'invisible') {
        const location = {
          x: element.layout.x,
          y: element.layout.y,
        };
        createdNode = ElementCreator.createInvisibleNode({
          graph,
          location,
          id: element.tag.nodeId,
        });
      } else {
        const { template } = templateList[element.tag.dataType];
        if (element.tag.dataType === 'data-type-3') {
          const imagePath = element.tag.activeImage?.path || element.tag.defaultImagePath;
          createdNode = graph.createNodeAt({
            location: new Rect(
              0,
              0,
              element.layout.width,
              element.layout.height,
            ),
            style: imagePath
              ? new ImageNodeStyle(imagePath)
              : new VuejsNodeStyle(template),
            tag: {
              ...templateList[element.tag.dataType].dataRest,
              ...element.tag,
              fontFamily: elementTemplates.fontFamily,
              nodeId: element.tag.nodeId || element.hashCode(),
            },
          });
        } else {
          const { tag } = element;
          if (element.tag.dataType.includes('label-type')) {
            if (!element.tag.textColor?.hex) {
              // rgba to hex
              if (element.tag.textColor?.rgbaObject) {
                const color = element.tag.textColor.rgbaObject;
                const {
                  r, g, b, a,
                } = color;
                tag.textColor.hex = Utils
                  .rgbaToHex(`rgba(${r},${g},${b}, ${a <= 1 ? 255 : a}`);
              }
              // old saved color to new format
              if (typeof element.tag.textColor === 'string') {
                const oldColor = element.tag.textColor;
                element.tag.textColor = {
                  hex: oldColor,
                };
              }
            }
          }
          createdNode = graph.createNodeAt({
            location: new Rect(
              0,
              0,
              element.layout.width,
              element.layout.height,
            ),
            style: new VuejsNodeStyle(template),
            tag: {
              ...templateList[element.tag.dataType].dataRest,
              ...tag,
              fontFamily: elementTemplates.fontFamily,
              nodeId: element.tag.nodeId || element.hashCode(),
            },
          });
        }
      }
      const nodePosition = new Rect(
        element.layout.x,
        element.layout.y,
        element.layout.width,
        element.layout.height,
      );
      graph.setNodeLayout(createdNode, nodePosition);
      const portsForCurrentNode = allElements
        .filter((el) => el.type === 'port' && el?.data?.owner === element.tag.nodeId);
      if (portsForCurrentNode?.length > 0) {
        portsForCurrentNode.forEach(({ data }) => {
          try {
            ElementCreator.createPort({
              graph,
              owner: createdNode,
              location: data.position,
              tag: data.tag,
            });
          } catch (e) {
            throw new Error(`ElementCreator: ${e}`);
          }
        });
      }
      resolve(createdNode);
    });
  }

  static createInvisibleNode({
    graph,
    location,
    id,
  }) {
    const { x, y } = location;
    const offset = 1.5;
    const createdNode = graph.createNode({
      layout: new Rect(
        x - offset,
        y - offset,
        3,
        3,
      ),
      style: new ShapeNodeStyle({
        shape: 'ellipse',
        fill: 'transparent',
        stroke: '1px transparent',
      }),
      tag: {
        dataType: 'invisible',
      },
    });
    createdNode.tag = {
      ...createdNode.tag,
      nodeId: id,
    };
    return createdNode;
  }

  static createRelativePort({
    graph,
    node,
    portId,
  }) {
    const createdNode = graph.addRelativePort(
      node,
      new Point(0, 0),
    );
    createdNode.tag = {
      portType: 'edge-to-edge',
      portId,
    };
    return createdNode;
  }

  static isString(value) {
    return typeof value === 'string';
  }

  static createNodeForEdge({
    graph,
    nodes,
    data,
  }) {
    let port = ElementCreator.getPortById({
      graph,
      portId: data?.port?.id,
    });
    // Target node
    let node = null;
    if (port?.owner) {
      node = port.owner;
    } else {
      node = nodes.find((el) => el.tag.nodeId === data.node.nodeId);
      const isStringId = ElementCreator.isString(data?.port?.id);
      if (!port) {
        if (isStringId) {
          port = graph.addPort(
            node,
            FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED,
          );
        }
        if (data?.port?.location && !isStringId) {
          port = graph.addPortAt(
            node,
            data.port.location,
          );
        }
      }
    }
    return {
      node,
      port,
    };
  }

  static createEdge({
    graph,
    edge,
  }) {
    const nodes = graph.nodes.toArray();
    return new Promise((resolve) => {
      const {
        node: targetNode,
        port: targetPort,
      } = ElementCreator.createNodeForEdge({
        graph,
        nodes,
        data: edge?.target,
      });
      const {
        node: sourceNode,
        port: sourcePort,
      } = ElementCreator.createNodeForEdge({
        graph,
        nodes,
        data: edge?.source,
      });

      const result = {};
      if (sourceNode) result.sourceNode = sourceNode;
      if (targetNode) result.targetNode = targetNode;
      if (sourcePort) result.sourcePort = sourcePort;
      if (targetPort) result.targetPort = targetPort;
      resolve(result);
    }).then((response) => new Promise((resolve, reject) => {
      let createdEdge;
      const { style: savedStyle } = edge;
      const strokeSize = typeof savedStyle.strokeSize === 'number'
        ? `${savedStyle.strokeSize}px`
        : savedStyle.strokeSize;
      const style = new PolylineEdgeStyle({
        smoothingLength: savedStyle.smoothingLength,
        stroke: `${strokeSize} solid ${savedStyle.strokeColor}`,
        targetArrow: 'none',
        sourceArrow: 'none',
      });
      if (response?.sourcePort && response?.targetPort) {
        if (!ElementCreator.checkCreatedEdge({
          graph,
          edge: response,
        })) {
          createdEdge = graph.createEdge({
            sourceNode: response.sourceNode,
            targetNode: response.targetNode,
            sourcePort: response.sourcePort,
            targetPort: response.targetPort,
            style,
            tag: edge.tag,
          });
        }
      } else {
        createdEdge = graph.createEdge({
          source: response.sourceNode,
          target: response.targetNode,
          style,
          tag: edge.tag,
        });
      }
      if (createdEdge) {
        resolve(createdEdge);
      } else {
        reject();
      }
    })).then((createdEdge) => new Promise((resolve) => {
      if (edge.bends?.length > 0) {
        edge.bends.forEach((bend) => {
          ElementCreator.createBend({
            graph,
            edge: createdEdge,
            position: bend,
          });
        });
      }
      resolve(createdEdge);
    }));
  }

  static checkCreatedEdge({
    graph,
    edge,
  }) {
    const targetPortPosX = edge?.targetPort?.location?.x;
    const targetPortPosY = edge?.targetPort?.location?.y;
    const sourcePortPosX = edge?.sourcePort?.location?.x;
    const sourcePortPosY = edge?.sourcePort?.location?.y;
    return graph.edges.toArray()
      .some(({ sourcePort, targetPort }) => sourcePort.location.x === sourcePortPosX
            && sourcePort.location.y === sourcePortPosY
            && targetPort.location.x === targetPortPosX
            && targetPort.location.y === targetPortPosY);
  }

  static createPort({
    graph,
    owner,
    location,
    tag,
  }) {
    graph.addPortAt({
      owner,
      location,
      tag,
    });
  }

  static createBend({
    graph,
    edge,
    position,
  }) {
    graph.addBend(edge, position);
  }

  static createLabels({
    graph,
    labelsList,
  }) {
    labelsList.forEach((el) => {
      const createdNode = ElementCreator.createInvisibleNode({
        graph,
        id: el.data.tag.id,
        location: el.data.position,
      });
      graph.addLabel({
        owner: createdNode,
        style: new DefaultLabelStyle({
          font: el.data.tag.font,
          textFill: el.data.tag.textColor.rgbaString,
          textSize: el.data.tag.fontSize,
          backgroundFill: 'transparent',
          backgroundStroke: 'transparent',
        }),
        text: el.data.text,
        tag: el.data.tag,
      });
    });
  }
}

export default ElementCreator;
