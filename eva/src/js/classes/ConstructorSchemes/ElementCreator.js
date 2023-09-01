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
        const nodeList = this.getElementsByType('node');
        const edgesList = this.getElementsByType('edge');
        const portsList = this.getElementsByType('port');
        const labelsList = this.getElementsByType('label');
        ElementCreator.createNodes({
          graph,
          nodeList,
          elementTemplates: this.elementTemplates,
          allElements: this.elements,
          portsList,
        })
          .then(() => {
            const updatedPortsList = this.getElementsByType('port');
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

  getElementsByType(type) {
    return this.elements.filter((el) => el.type === type);
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
      return graph.ports.toArray().find(({ tag }) => tag.portId === sourcePortId);
    }
    return null;
  }

  static createEdges({
    graph,
    edgesList,
  }) {
    return new Promise((resolve, reject) => {
      try {
        if (edgesList?.length > 0) {
          edgesList.forEach(({ data }) => {
            ElementCreator.createEdge({
              graph,
              edge: data,
            });
          });
        }
        resolve();
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
          });
        });
        resolve();
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
      portsList.filter((el) => el?.data?.owner?.id === nodeId || el?.data?.owner?.id === edgeId)
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
              ...element.tag,
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
    const createdNode = graph.createNode({
      layout: new Rect(location.x - 1.5, location.y - 1.5, 3, 3),
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

  static createEdge({
    graph,
    edge,
  }) {
    new Promise((resolve) => {
      let targetPort = typeof edge?.target?.port?.id === 'number'
        ? ElementCreator.getTargetPort({
          graph,
          targetPortId: edge?.target?.port?.id,
        })
        : null;
      let sourcePort = typeof edge?.source?.port?.id === 'number'
        ? ElementCreator.getSourcePort({
          graph,
          sourcePortId: edge?.source?.port?.id,
        })
        : null;
      let targetNode = null;
      if (targetPort?.owner) {
        targetNode = targetPort?.owner;
      } else {
        targetNode = graph.nodes.toArray()
          .find((el) => el.tag.nodeId === edge.target.node.nodeId);
        if (
          !targetPort
            && (edge?.target?.port?.location
                || typeof edge?.target?.port?.id === 'string')
        ) {
          if (typeof edge?.target?.port?.id === 'string') {
            targetPort = graph.addPort(
              targetNode,
              FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED,
            );
          }
          if (edge?.target?.port?.location) {
            targetPort = graph.addPortAt(
              targetNode,
              edge.target.port.location,
            );
          }
        }
      }
      let sourceNode = null;
      if (sourcePort?.owner) {
        sourceNode = sourcePort?.owner;
      } else {
        sourceNode = graph.nodes.toArray()
          .find((el) => el.tag.nodeId === edge.source.node.nodeId);
        if (
          !sourcePort
            && (typeof edge?.source?.port?.id === 'string'
                || edge?.source?.port?.location)
        ) {
          if (typeof edge.source.port.id === 'string') {
            sourcePort = graph.addPortAt(
              sourceNode,
              edge.source.port.location,
            );
          } else {
            sourcePort = graph.addPortAt(
              sourceNode,
              edge.source.port.location,
            );
          }
        }
      }
      const result = {};
      if (sourceNode) result.sourceNode = sourceNode;
      if (targetNode) result.targetNode = targetNode;
      if (sourcePort) result.sourcePort = sourcePort;
      if (targetPort) result.targetPort = targetPort;
      resolve(result);
    }).then((response) => new Promise((resolve, reject) => {
      let createdEdge;
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
            style: new PolylineEdgeStyle({
              smoothingLength: edge.style.smoothingLength,
              stroke: `${typeof edge.style.strokeSize === 'number'
                ? `${edge.style.strokeSize}px`
                : edge.style.strokeSize} solid ${edge.style.strokeColor}`,
              targetArrow: 'none',
              sourceArrow: 'none',
            }),
            tag: edge.tag,
          });
        }
      } else {
        createdEdge = graph.createEdge({
          source: response.sourceNode,
          target: response.targetNode,
          style: new PolylineEdgeStyle({
            smoothingLength: edge.style.smoothingLength,
            stroke: `${typeof edge.style.strokeSize === 'number'
              ? `${edge.style.strokeSize}px`
              : edge.style.strokeSize} solid ${edge.style.strokeColor}`,
            targetArrow: 'none',
            sourceArrow: 'none',
          }),
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
      .some((el) => el.sourcePort.location.x === sourcePortPosX
            && el.sourcePort.location.y === sourcePortPosY
            && el.targetPort.location.x === targetPortPosX
            && el.targetPort.location.y === targetPortPosY);
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
