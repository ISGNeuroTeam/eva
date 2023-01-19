import {
  Point, PolylineEdgeStyle, Rect, ShapeNodeStyle, DefaultLabelStyle,
} from 'yfiles';
import elementTemplates from './elementTemplates.js';
import VuejsNodeStyle from '@/js/classes/ConstructorSchemes/VueNodeStyle';
import GenerateIcons from '@/js/classes/ConstructorSchemes/GenerateIcons';

class ElementCreator {
  constructor({
    graph,
    elements,
  }) {
    this.graph = graph;
    this.elements = elements;
    this.elementTemplates = elementTemplates;
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
      return this.graph.ports.toArray().find(({ tag }) => tag.portId === targetPortId);
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
        const imageNode = GenerateIcons.getIconNode({
          data: element,
          size: element.layout,
        });
        createdNode = this.graph.createNodeAt({
          location: imageNode.layout,
          style: imageNode.style.clone(),
          tag: imageNode.tag,
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
      const targetPort = this.getTargetPort(edge.target.port.id);
      const sourcePort = this.getSourcePort(edge.source.port.id);
      const targetNode = targetPort.owner;
      const sourceNode = sourcePort.owner;
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
          stroke: `${edge.style.strokeSize}px solid ${edge.style.strokeColor}`,
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
