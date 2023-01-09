import { PolylineEdgeStyle, Rect } from 'yfiles';
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
          .then(() => this.createEdges())
          .then(() => {
            resolve();
          });
        // this.elements.forEach((element) => {
        //   if (element.type === 'node') {
        //     this.createNode(element.data);
        //   }
        //   if (element.type === 'edge') {
        //     this.createEdge(element.data);
        //   }
        //   if (element.type === 'port') {
        //     this.createPort(element.data);
        //   }
        // });
      } catch (e) {
        reject(e);
      }
    });
  }

  getElementsByType(type) {
    return this.elements.filter((el) => el.type === type);
  }

  createEdges() {
    return new Promise((resolve, reject) => {
      try {
        const edgesList = this.getElementsByType('edge');
        if (edgesList?.length > 0) {
          edgesList.forEach((edge) => {
            this.createEdge(edge.data);
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
          this.createNode(element.data);
        });
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  getNodeById(id) {
    return this.graph.nodes.toArray().find((node) => node.tag.nodeId === id);
  }

  getPortsForNodes(nodesList) {
    const nodesIdList = nodesList.map((el) => el.data.tag.nodeId);
    return this.elements
      .filter((el) => el.type === 'port' && nodesIdList
        .some((id) => id === el.data.owner));
  }

  createNode(element) {
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
  }

  createEdge(edge) {
    const createdEdge = this.graph.createEdge({
      sourcePort: this.getPortByLocation(edge.source.port.location),
      targetPort: this.getPortByLocation(edge.target.port.location),
      style: new PolylineEdgeStyle({
        smoothingLength: edge.style.smoothingLength,
        stroke: `${edge.style.strokeSize}px solid ${edge.style.strokeColor}`,
        targetArrow: 'none',
        sourceArrow: 'none',
      }),
      tag: edge.tag,
    });
    if (edge.bends?.length > 0) {
      edge.bends.forEach((bend) => {
        this.createBend(createdEdge, bend);
      });
    }
  }

  getPortByLocation(location) {
    return this.graph.ports.toArray()
      .find((el) => el.dynamicLocation.x === location.x && el.dynamicLocation.y === location.y);
  }

  createPort(owner, location, tag) {
    this.graph.addPortAt({
      owner,
      location,
      tag,
    });
  }

  createLabel() {}

  createBend(edge, position) {
    this.graph.addBend(edge, position);
  }
}

export default ElementCreator;
