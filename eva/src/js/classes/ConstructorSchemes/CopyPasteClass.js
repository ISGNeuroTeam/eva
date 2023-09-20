import { IEdge, INode, IPort } from 'yfiles';
import SchemeUpdater from '@/js/classes/ConstructorSchemes/SchemeUpdater';
import elementTemplates from '@/js/classes/ConstructorSchemes/elementTemplates';
import ElementCreator from '@/js/classes/ConstructorSchemes/ElementCreator';

class CopyPasteClass {
  constructor({ graph }) {
    this.graph = graph;
    this.selectedElementsTemplates = [];
    this.offset = null;
  }

  getNodeFromGraph({
    nodeId, portId,
  }) {
    const foundNode = this.graph.nodes.toArray()
      .find(({ tag }) => tag.nodeId === nodeId || tag.nodeId === portId);
    if (foundNode) {
      return {
        location: {
          x: foundNode.layout.x,
          y: foundNode.layout.y,
        },
        nodeId: foundNode.tag.nodeId,
      };
    }
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  getNodeFromCopiedElements({
    elements,
    nodeId,
    portId,
  }) {
    const result = elements
      .find(({ tag }) => tag?.nodeId === nodeId || tag?.nodeId === portId);
    if (result) {
      return SchemeUpdater.getNode(result);
    }
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  prepareCopiedElements(elements) {
    if (!elements || elements?.length === 0) {
      return [];
    }
    const result = [];
    for (let i = 0; i < elements.length; i += 1) {
      const element = elements[i];
      const isNode = element instanceof INode && element.tag.dataType !== 'invisible';
      const isEdge = element instanceof IEdge;
      const isPort = element instanceof IPort;
      if (isNode) {
        result.push({
          type: 'node',
          data: SchemeUpdater.getNode(element),
        });
      } else if (isEdge) {
        const edgeTemplate = SchemeUpdater.getEdgeData(element);
        const targetNodeID = edgeTemplate.target.node;
        const targetPortID = edgeTemplate.target.port.id;
        const sourceNodeID = edgeTemplate.source.node;
        const sourcePortID = edgeTemplate.source.port.id;
        const targetNode = this.getNodeFromCopiedElements({
          elements,
          nodeId: targetNodeID,
          portId: targetPortID,
        });
        const isTargetNodeValid = CopyPasteClass.isValidNode(targetNode);
        const customTargetNode = {
          layout: {
            x: edgeTemplate.target.port.location.x,
            y: edgeTemplate.target.port.location.y,
            width: 3,
            height: 3,
          },
          tag: {
            dataType: 'invisible',
            nodeId: edgeTemplate.target.node
              || edgeTemplate.target.port.id,
          },
        };
        const sourceNode = this.getNodeFromCopiedElements({
          elements,
          nodeId: sourceNodeID,
          portId: sourcePortID,
        });
        const isSourceNodeValid = CopyPasteClass.isValidNode(sourceNode);
        const customSourceNode = {
          layout: {
            x: edgeTemplate.source.port.location.x,
            y: edgeTemplate.source.port.location.y,
            width: 3,
            height: 3,
          },
          tag: {
            dataType: 'invisible',
            nodeId: edgeTemplate.source.node
              || edgeTemplate.source.port.id,
          },
        };
        if (isTargetNodeValid && isSourceNodeValid) {
          result.push({
            type: 'edge',
            data: edgeTemplate,
          });
        } else if (isTargetNodeValid) {
          result.push({
            type: 'edge',
            data: edgeTemplate,
          });
          result.push({
            type: 'node',
            data: customSourceNode,
          });
        } else if (isSourceNodeValid) {
          result.push({
            type: 'edge',
            data: edgeTemplate,
          });
          result.push({
            type: 'node',
            data: customTargetNode,
          });
        } else {
          result.push({
            type: 'edge',
            data: edgeTemplate,
          });
          result.push({
            type: 'node',
            data: customSourceNode,
          });
          result.push({
            type: 'node',
            data: customTargetNode,
          });
        }
      } else if (isPort) {
        result.push({
          type: 'port',
          data: SchemeUpdater.getPortData(element),
        });
      }
    }
    return result;
  }

  // Валидация ноды связанной с эджем
  static isValidNode(node) {
    if (!node) {
      return false;
    }
    return node?.tag?.dataType !== 'invisible';
  }

  copy(selectedElements) {
    if (selectedElements?.length > 0) {
      const result = this.prepareCopiedElements(selectedElements);
      this.selectedElementsTemplates = structuredClone(result);
      this.offset = this.getOffsetSelectedElements();
    }
  }

  getOffsetSelectedElements() {
    const elements = this.selectedElementsTemplates;
    if (!elements || elements.length === 0) {
      return {
        x: 0,
        y: 0,
      };
    }

    const firstElement = elements[0];
    let minX = firstElement?.data?.layout?.x ?? 0;
    let minY = firstElement?.data?.layout?.y ?? 0;
    let maxX = firstElement?.data?.layout?.maxX ?? 0;
    let maxY = firstElement?.data?.layout?.maxY ?? 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const element of elements) {
      const item = element.data;
      if (element.type === 'node') {
        const layout = item?.layout;
        if (layout) {
          minX = Math.min(minX, layout.x ?? 0);
          minY = Math.min(minY, layout.y ?? 0);
          maxX = Math.max(maxX, layout.maxX ?? 0);
          maxY = Math.max(maxY, layout.maxY ?? 0);
        }
      } else if (element.type === 'edge') {
        const targetLocation = item?.target?.port?.location;
        const sourceLocation = item?.source?.port?.location;
        if (targetLocation && sourceLocation) {
          const targetX = targetLocation.x ?? 0;
          const targetY = targetLocation.y ?? 0;
          const sourceX = sourceLocation.x ?? 0;
          const sourceY = sourceLocation.y ?? 0;
          const edgeMinX = Math.min(sourceX, targetX);
          const edgeMinY = Math.min(sourceY, targetY);
          const edgeMaxX = Math.max(sourceX, targetX);
          const edgeMaxY = Math.max(sourceY, targetY);
          minX = Math.min(minX, edgeMinX);
          minY = Math.min(minY, edgeMinY);
          maxX = Math.max(maxX, edgeMaxX);
          maxY = Math.max(maxY, edgeMaxY);
          const bends = item?.bends;
          if (bends && bends.length > 0) {
            // eslint-disable-next-line no-restricted-syntax
            for (const bend of bends) {
              const bendX = bend?.x ?? 0;
              const bendY = bend?.y ?? 0;
              minX = Math.min(minX, bendX);
              minY = Math.min(minY, bendY);
              maxX = Math.max(maxX, bendX);
              maxY = Math.max(maxY, bendY);
            }
          }
        }
      }
    }

    const width = maxX - minX;
    const height = maxY - minY;
    return {
      x: width / 2,
      y: height / 2,
    };
  }

  updateElementsPosition() {
    for (let index = 0; index < this.selectedElementsTemplates.length; index += 1) {
      const element = this.selectedElementsTemplates[index];
      if (element.type === 'node') {
        element.data.layout.x += this.offset.x;
        element.data.layout.y += this.offset.y;
      } else if (element.type === 'edge') {
        element.data.source.port.location.x += this.offset.x;
        element.data.source.port.location.y += this.offset.y;
        element.data.target.port.location.x += this.offset.x;
        element.data.target.port.location.y += this.offset.y;
        if (element.data.bends?.length > 0) {
          for (let bendIndex = 0; bendIndex < element.data.bends.length; bendIndex += 1) {
            const bendItem = element.data.bends[bendIndex];
            bendItem.x += this.offset.x;
            bendItem.y += this.offset.y;
          }
        }
      } else if (element.type === 'port') {
        element.data.position.x += this.offset.x;
        element.data.position.y += this.offset.y;
      }
    }
  }

  paste(allElements) {
    return new Promise((resolve) => {
      this.updateElementsPosition();
      const nodes = [];
      const edges = [];
      const ports = [];
      // Sort elements by type
      for (let i = 0; i < this.selectedElementsTemplates.length; i += 1) {
        const element = this.selectedElementsTemplates[i];
        if (element.type === 'node') {
          nodes.push(element);
        } else if (element.type === 'edge') {
          edges.push(element);
        } else if (element.type === 'port') {
          ports.push(element);
        }
      }
      const elementsForSelect = [];
      ElementCreator.createNodes({
        graph: this.graph,
        allElements,
        elementTemplates,
        nodeList: nodes,
        portsList: ports,
      }).then((createdNodes) => {
        elementsForSelect.push(...createdNodes);
        return ElementCreator.createEdges({
          graph: this.graph,
          edgesList: edges,
        });
      }).then((createdEdges) => {
        elementsForSelect.push(...createdEdges);
      });
      resolve(elementsForSelect);
    });
  }
}

export default CopyPasteClass;
