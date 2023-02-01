import {
  Point, PolylineEdgeStyle, Rect, ShapeNodeStyle, DefaultLabelStyle, FreeNodePortLocationModel,
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
    this.elementTemplates = ElementTemplates.templates;
    this.defaultEdgeStyles = defaultEdgeStyles;
  }

  buildGraph() {
    return new Promise((resolve, reject) => {
      try {
        this.graph.clear();
        this.createNodes()
          .then(() => this.createPorts())
          .then(() => this.createEdges())
          .then(() => this.createLabels())
          .then(() => {
            resolve();
          });
      } catch (e) {
        reject(e);
      }
    });
  }

  createPorts() {
    return new Promise((resolve) => {
      const ports = this.getElementsByType('port');
      const portsFromGraph = this.graph.ports.toArray();
      const filteredPorts = [];
      ports.forEach((port) => {
        if (!portsFromGraph.some((el) => port.data.tag.portId === el.tag.portId)) {
          filteredPorts.push(port.data);
        }
      });
      filteredPorts.forEach((el) => {
        const createdNode = this.createInvisibleNode(el.position, el.tag.portId);
        this.createRelativePort(createdNode, el.tag.portId);
      });
      resolve();
    });
  }

  getElementsByType(type) {
    return this.elements.filter((el) => el.type === type);
  }

  getTargetPort(targetPortId) {
    if (this.graph.ports.toArray()?.length > 0) {
      return this.graph.ports.toArray().find(({ tag }) => tag?.portId === targetPortId);
    }
    return null;
  }

  getSourcePort(sourcePortId) {
    if (this.graph.ports.toArray()?.length > 0) {
      return this.graph.ports.toArray().find(({ tag }) => tag.portId === sourcePortId);
    }
    return null;
  }

  createEdges() {
    return new Promise((resolve, reject) => {
      try {
        const edgesList = this.getElementsByType('edge');
        if (edgesList?.length > 0) {
          edgesList.forEach(({ data }) => {
            this.createEdge(data);
          });
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  createNodes() {
    return new Promise((resolve, reject) => {
      try {
        const nodeList = this.getElementsByType('node');
        nodeList.forEach((element) => {
          this.createNode(element.data).then((createdNode) => {
            this.createPortsById(createdNode);
          });
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  createPortsById(element) {
    const portList = this.getElementsByType('port');
    const nodeId = element?.tag?.nodeId;
    const edgeId = element?.tag?.edgeId;
    if (portList?.length > 0) {
      const filteredPortsList = portList
        .filter((el) => el?.data?.owner?.id === nodeId || el?.data?.owner?.id === edgeId);
      if (filteredPortsList?.length > 0) {
        filteredPortsList.forEach((port) => {
          if (nodeId) {
            this.createPort(this.getNodeById(nodeId), port.data.position, port.data.tag);
          }
        });
      }
    }
  }

  getNodeById(id) {
    return this.graph.nodes.toArray().find((node) => node.tag.nodeId === id);
  }

  createNode(element) {
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
        createdNode = this.graph.createNodeAt({
          location: imageNode.layout,
          style: imageNode.style.clone(),
          tag: {
            ...imageNode.tag,
            ...element.tag,
          },
        });
      } else if (element.tag?.dataType === 'invisible') {
        createdNode = this.createInvisibleNode(
          element.layout.x,
          element.layout.y,
          element.tag.nodeId,
        );
      } else {
        const { template } = this.elementTemplates[element.tag.dataType];
        createdNode = this.graph.createNodeAt({
          location: new Rect(
            0,
            0,
            element.layout.width,
            element.layout.height,
          ),
          style: new VuejsNodeStyle(template),
          tag: {
            ...element.tag,
            fontFamily: ElementTemplates.fontFamily,
            nodeId: element.tag.nodeId || element.hashCode(),
          },
        });
      }
      const nodePosition = new Rect(
        element.layout.x,
        element.layout.y,
        element.layout.width,
        element.layout.height,
      );
      this.graph.setNodeLayout(createdNode, nodePosition);
      const portsForCurrentNode = this.elements.filter((el) => el.type === 'port' && el?.data?.owner === element.tag.nodeId);
      if (portsForCurrentNode?.length > 0) {
        portsForCurrentNode.forEach(({ data }) => {
          try {
            this.createPort(createdNode, data.position, data.tag);
          } catch (e) {
            throw new Error(e);
          }
        });
      }
      resolve(createdNode);
    });
  }

  createInvisibleNode(location, id) {
    const createdNode = this.graph.createNode({
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

  createRelativePort(node, portId) {
    const createdNode = this.graph.addRelativePort(
      node,
      new Point(0, 0),
    );
    createdNode.tag = {
      portType: 'edge-to-edge',
      portId,
    };
    return createdNode;
  }

  createEdge(edge) {
    new Promise((resolve) => {
      let targetPort = typeof edge.target.port.id === 'number'
        ? this.getTargetPort(edge.target.port.id)
        : null;
      let sourcePort = typeof edge.source.port.id === 'number'
        ? this.getSourcePort(edge.source.port.id)
        : null;
      let targetNode = null;
      if (targetPort?.owner) {
        targetNode = targetPort?.owner;
      } else {
        targetNode = this.graph.nodes.toArray()
          .find((el) => el.tag.nodeId === edge.target.node.nodeId);
        if (!targetPort) {
          if (typeof edge.target.port.id === 'string') {
            targetPort = this.graph.addPort(
              targetNode,
              FreeNodePortLocationModel.NODE_BOTTOM_ANCHORED,
            );
          } else {
            targetPort = this.graph.addPortAt(
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
        sourceNode = this.graph.nodes.toArray()
          .find((el) => el.tag.nodeId === edge.source.node.nodeId);
        if (!sourcePort) {
          if (typeof edge.source.port.id === 'string') {
            sourcePort = this.graph.addPortAt(
              sourceNode,
              edge.source.port.location,
            );
          } else {
            sourcePort = this.graph.addPortAt(
              sourceNode,
              edge.source.port.location,
            );
          }
        }
      }
      resolve({
        sourceNode,
        targetNode,
        sourcePort,
        targetPort,
      });
    }).then((response) => new Promise((resolve) => {
      const createdEdge = this.graph.createEdge({
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
      resolve(createdEdge);
    })).then((createdEdge) => new Promise((resolve) => {
      if (edge.bends?.length > 0) {
        edge.bends.forEach((bend) => {
          this.createBend(createdEdge, bend);
        });
      }
      resolve(createdEdge);
    }));
  }

  createPort(owner, location, tag) {
    this.graph.addPortAt({
      owner,
      location,
      tag,
    });
  }

  createBend(edge, position) {
    this.graph.addBend(edge, position);
  }

  createLabels() {
    const labels = this.getElementsByType('label');
    labels.forEach((el) => {
      const createdNode = this.createInvisibleNode(el.data.position, el.data.tag.id);
      this.graph.addLabel({
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
