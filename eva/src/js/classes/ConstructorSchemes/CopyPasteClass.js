import { IEdge, INode, IPort } from 'yfiles';
import SchemeUpdater from '@/js/classes/ConstructorSchemes/SchemeUpdater';

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
      .find(({ tag }) => tag.nodeId === nodeId || tag.nodeId === portId);
    if (result) {
      return SchemeUpdater.getNode(result);
    }
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  getTargetNodeFromCopiedElements({ elements, edgeTemplate }) {
    const nodeId = edgeTemplate.target.node;
    const portId = edgeTemplate.target.port.id;
    return elements
      .find(({ tag }) => tag.nodeId === nodeId || tag.nodeId === portId);
  }

  // eslint-disable-next-line class-methods-use-this
  getSourceNodeFromCopiedElements({ elements, edgeTemplate }) {
    const nodeId = edgeTemplate.source.node;
    const portId = edgeTemplate.source.port.id;
    return elements
      .find(({ tag }) => tag.nodeId === nodeId || tag.nodeId === portId);
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
        const sourceNode = this.getNodeFromCopiedElements({
          elements,
          nodeId: sourceNodeID,
          portId: sourcePortID,
        });
        if (targetNode && sourceNode) {
          result.push({
            type: 'edge',
            data: SchemeUpdater.getEdgeData(element),
          });
          console.log(targetNode, sourceNode);
        } else if (targetNode) {
          console.log(
            targetNode,
            {
              layout: {
                x: edgeTemplate.source.port.location.x,
                y: edgeTemplate.source.port.location.y,
              },
              tag: {
                dataType: 'invisible',
                nodeId: edgeTemplate.source.port.id,
              },
            },
          );
        } else if (sourceNode) {
          console.log(
            sourceNode,
            {
              layout: {
                x: edgeTemplate.target.port.location.x,
                y: edgeTemplate.target.port.location.y,
              },
              tag: {
                dataType: 'invisible',
                nodeId: edgeTemplate.target.port.id,
              },
            },
          );
        } else {
          console.log(
            {
              layout: {
                x: edgeTemplate.source.port.location.x,
                y: edgeTemplate.source.port.location.y,
              },
              tag: {
                dataType: 'invisible',
                nodeId: edgeTemplate.source.port.id,
              },
            },
            {
              layout: {
                x: edgeTemplate.target.port.location.x,
                y: edgeTemplate.target.port.location.y,
              },
              tag: {
                dataType: 'invisible',
                nodeId: edgeTemplate.target.port.id,
              },
            },
          );
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

  copy(selectedElements) {
    if (selectedElements?.length > 0) {
      const result = this.prepareCopiedElements(selectedElements);
      this.selectedElementsTemplates = structuredClone(result);
      this.offset = this.getOffsetSelectedElements();

      // for (let i = 0; i < this.selectedElementsTemplates; i += 1) {
      //   const element = this.selectedElementsTemplates[i];
      //   if (element.type === 'node') {
      //     element.data.layout.x += this.offset.x;
      //     element.data.layout.y += this.offset.y;
      //   } else if (element.type === 'edge') {
      //
      //   } else if (element.type === 'port') {
      //
      //   }
      // }
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

    let minX = -Infinity;
    let minY = -Infinity;
    let maxX = Infinity;
    let maxY = Infinity;

    // eslint-disable-next-line no-restricted-syntax
    for (const element of elements) {
      const item = element.data;
      if (element.type === 'node') {
        minX = Math.min(minX, item.layout.x);
        minY = Math.min(minY, item.layout.y);
        maxX = Math.max(maxX, item.layout.maxX);
        maxY = Math.max(maxY, item.layout.maxY);
      } else if (element.type === 'edge') {
        const targetLocation = item?.target?.port?.location;
        const sourceLocation = item?.source?.port?.location;
        if (targetLocation && sourceLocation) {
          const targetX = targetLocation.x;
          const targetY = targetLocation.y;
          const sourceX = sourceLocation.x;
          const sourceY = sourceLocation.y;
          const edgeMinX = Math.min(sourceX, targetX);
          const edgeMinY = Math.min(sourceY, targetY);
          const edgeMaxX = Math.max(sourceX, targetX);
          const edgeMaxY = Math.max(sourceY, targetY);

          minX = Math.min(minX, edgeMinX);
          minY = Math.min(minY, edgeMinY);
          maxX = Math.max(maxX, edgeMaxX);
          maxY = Math.max(maxY, edgeMaxY);

          const { bends } = item;
          if (bends && bends.length > 0) {
            // eslint-disable-next-line no-restricted-syntax
            for (const bend of bends) {
              const bendX = bend.x;
              const bendY = bend.y;
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

  paste() {
    console.log('this.selectedElementsTemplates', this.selectedElementsTemplates);
    console.log('offset', this.getOffsetSelectedElements());
  }
}

export default CopyPasteClass;
