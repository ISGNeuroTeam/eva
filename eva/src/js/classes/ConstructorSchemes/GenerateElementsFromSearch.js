import {
  Color, Point,
} from 'yfiles';
import GenerateIcons from '@/js/classes/ConstructorSchemes/GenerateIcons';
import Utils from '@/js/classes/ConstructorSchemes/Utils';

class GenerateElementsFromSearch {
  constructor({
    graphComponent,
    elements,
    defaultEdgeStyles,
    colorEdgeByType,
    defaultDescriptionStyles,
  }) {
    this.graphComponent = graphComponent;
    this.elements = elements;
    this.allParentNodes = [];
    this.allChildNodes = [];
    this.allEdges = [];
    this.allParentNodes = [];
    this.allMetricNodes = [];
    this.otherNodes = [];
    this.defaultEdgeStyles = defaultEdgeStyles;
    this.colorEdgeByType = colorEdgeByType;
    this.defaultDescriptionStyles = defaultDescriptionStyles;
  }

  get getGraphHeight() {
    return this.graphComponent.size.height;
  }

  get getGraphWidth() {
    return this.graphComponent.size.width;
  }

  // Scale world coordinates to graph size
  worldToGraphCoordinates(list) {
    const filteredList = list.map((elem) => {
      const { x, y } = this.graphComponent.toViewCoordinates(
        new Point(
          elem.x,
          elem.y,
        ),
      );
      return {
        ...elem,
        x,
        y,
        x1: elem.x,
        y1: elem.y,
      };
    });
    const initialSizes = filteredList.reduce((acc, el) => {
      acc.xMin = acc.xMin === null || el.x < acc.xMin ? el.x : acc.xMin;
      acc.xMax = acc.xMin === null || el.x > acc.xMax ? el.x : acc.xMax;

      acc.yMin = acc.yMin === null || el.y < acc.yMin ? el.y : acc.yMin;
      acc.yMax = acc.yMin === null || el.y > acc.yMax ? el.y : acc.yMax;

      return acc;
    }, {
      xMin: null,
      yMin: null,
      xMax: null,
      yMax: null,
    });
    initialSizes.width = (initialSizes.xMax) - (initialSizes.xMin);
    initialSizes.height = (initialSizes.yMax) - (initialSizes.yMin);
    return filteredList.map((el) => ({
      ...el,
      // TODO: + 1 - это костыль для фиксса ошибки NaN в node.layout т.к.
      //  0 не определяется как число
      x: 1 + Math.round(((this.getGraphWidth - 200) / 100)
          * ((initialSizes.xMax - el.x) * (100 / initialSizes.width))),
      y: 1 + Math.round(((this.getGraphHeight - 150) / 100)
          * ((initialSizes.yMax - el.y) * (100 / initialSizes.height))),
    }));
  }

  getParentNodeById(id) {
    return this.allParentNodes
      .find((el) => el?.data?.tag?.nodeId === `parent-${id}`);
  }

  getSortedElementByX(elements) {
    return elements.sort((a, b) => a.data.layout.x - b.data.layout.x);
  }

  // Generate all elements for build\save scheme elements from otl-search
  generate() {
    const generateIcons = new GenerateIcons();
    const edgeTemplate = {
      type: 'edge',
      data: {
        bends: [],
        labels: [],
        style: this.defaultEdgeStyles,
        source: {
          node: null,
          port: {
            id: null,
            location: {
              x: null,
              y: null,
            },
          },
        },
        target: {
          node: null,
          port: {
            id: null,
            location: {
              x: null,
              y: null,
            },
          },
        },
        tag: {
          edgeId: null,
        },
      },
    };
    return new Promise((resolve, reject) => {
      try {
        // Get sizes equal to the size of the original icon
        generateIcons.generateIconNodes(this.elements)
          .then((elementsWithIcons) => new Promise((res, rej) => {
            try {
              if (elementsWithIcons?.length > 0) {
                elementsWithIcons.forEach((element, index) => {
                  // Removing extra fields
                  // icon instanceof INode - be sure to delete before saving
                  // layout - will move to element.tag
                  const fromOtl = Utils.deleteFieldsFromObject(
                    element,
                    ['icon', 'layout'],
                  );
                  // Only parent\child have "type" field !== false
                  if (element?.type) {
                    // Finding for a previously created parent-element
                    const parentNode = this.getParentNodeById(element.type);
                    if (!parentNode) {
                      // Parent node
                      this.allParentNodes.push({
                        type: 'node',
                        data: {
                          tag: {
                            fromOtl: {
                              ...fromOtl,
                              token_type: `parent-${element.type}`,
                              x: element.layout.x,
                              y: element.layout.y,
                            },
                            dataType: 'image-node',
                            nodeId: `parent-${element.type}`,
                            portType: element.type,
                          },
                          icon: element.parent_icon || element.icon.node.style.image,
                          layout: element.layout,
                        },
                      });
                    }
                    // Child node
                    this.allChildNodes.push({
                      type: 'node',
                      data: {
                        tag: {
                          fromOtl: {
                            ...fromOtl,
                            token_type: `child-${element.type}_${index}`,
                            x: element.layout.x,
                            y: element.layout.y,
                          },
                          dataType: 'image-node',
                          nodeId: `child-${element.type}_${index}`,
                          portType: element.type,
                        },
                        layout: element.layout,
                        icon: element.icon.node.style.image,
                      },
                    });
                    // Edges
                    this.allEdges.push({
                      ...edgeTemplate,
                      data: {
                        ...edgeTemplate.data,
                        style: {
                          ...this.defaultEdgeStyles,
                          strokeColor: element?.edge_color
                            ? element.edge_color
                            : this.defaultEdgeStyles.strokeColor,
                        },
                        source: {
                          node: {
                            nodeId: this.getParentNodeById(element.type).data.tag.nodeId,
                          },
                          port: null,
                        },
                        target: {
                          node: {
                            nodeId: `child-${element.type}_${index}`,
                          },
                          port: null,
                        },
                      },
                    });
                  } else {
                    // Other node
                    this.otherNodes.push({
                      type: 'node',
                      data: {
                        tag: {
                          fromOtl: {
                            ...fromOtl,
                            token_type: `other-${element.type}`,
                            x: element.layout.x,
                            y: element.layout.y,
                          },
                          dataType: 'image-node',
                          nodeId: `other-${index}`,
                          portType: element.type,
                        },
                        icon: element.icon.node.style.image,
                        layout: {
                          width: Number(element.layout.width),
                          height: Number(element.layout.height),
                          x: 1,
                        },
                      },
                    });
                  }
                });
                res();
              }
            } catch (e) {
              rej(e);
            }
          }))
          .then(() => new Promise((res, rej) => {
            try {
              // Get parent-node sizes equal to the size of the original icon
              const parentIconsList = this.allParentNodes.map((el) => el.data);
              const result = generateIcons.generateIconNodes(parentIconsList);
              res(result);
            } catch (e) {
              rej(e);
            }
          }))
          .then((parentElements) => new Promise((res, rej) => {
            try {
              const allParentNodes = parentElements.map((el) => ({
                type: 'node',
                data: {
                  ...el,
                  icon: el.icon.node.style.image,
                  layout: {
                    width: Number(el.layout.width),
                    height: Number(el.layout.height),
                    x: el.tag.fromOtl.x,
                    y: el.tag.fromOtl.y,
                  },
                },
              }));
              const sortedChildElByX = this.getSortedElementByX(this.allChildNodes);
              const sortedParentElByX = this.getSortedElementByX(allParentNodes);

              // calc position parent and child nodes
              // X position child
              const widthForDrawChild = this.getGraphWidth * 0.7;
              const offset = this.getGraphWidth - widthForDrawChild;
              const startPosition = (widthForDrawChild / sortedChildElByX.length);

              // Y position child
              const yPosition = this.getGraphHeight - (this.getGraphHeight * 0.05);

              this.allChildNodes = sortedChildElByX.map((el, index) => ({
                ...el,
                data: {
                  ...el.data,
                  layout: {
                    width: Number(el.data.layout.width),
                    height: Number(el.data.layout.height),
                    x: index > 0
                      ? (startPosition * index)
                        + offset
                        + ((Number(el.data.layout.width) / 2) * index)
                      : (startPosition * index) + offset,
                    y: yPosition,
                  },
                },
              }));

              this.allParentNodes = sortedParentElByX.map((el, i, arr) => ({
                ...el,
                data: {
                  ...el.data,
                  layout: {
                    ...el.data.layout,
                    width: Number(el.data.layout.width),
                    height: Number(el.data.layout.height),
                    x: i > 0
                      ? this.allChildNodes[i - 1].data.layout.x
                        + Number(arr[i - 1].data.layout.width)
                        + (Number(el.data.layout.width) / 2)
                      : this.allChildNodes[i].data.layout.x,
                    y: 1,
                  },
                },
              }));

              // calc position other nodes
              let counter = 0;
              this.otherNodes = this.otherNodes.map((el, i) => {
                if (i % 2 === 0 && i >= 2) {
                  counter += 1;
                }
                return {
                  ...el,
                  data: {
                    ...el.data,
                    layout: {
                      ...el.data.layout,
                      x: el.data.layout.width * ((i + 1) % 2),
                      y: i < 2
                        ? 1
                        : ((this.getGraphHeight / this.otherNodes.length)
                          + el.data.layout.height) * counter,
                    },
                  },
                };
              });
              res();
            } catch (e) {
              rej(e);
            }
          }))
          .then(() => new Promise((res, rej) => {
            try {
              this.allArrowNodes = [];
              this.allChildNodes.forEach((el, i, arr) => {
                if (arr[i - 1]) {
                  const prevX = arr[i - 1].data.layout.x;
                  const curX = el.data.layout.x;
                  // const xByArrow = curX - ((curX - prevX) / 2);
                  const xByArrow = (curX + prevX) / 2;

                  const curY = el.data.layout.y;
                  // const prevY = arr[i - 1].data.layout.y;
                  const curHeight = el.data.layout.height;
                  const yByArrow = curY + (curHeight / 8);
                  const arrowWidth = (curX - prevX) * 0.5;

                  // const x1 = 77.33208064;
                  // const y1 = 61.48473844;
                  // const x2 = 77.33245628;
                  // const y2 = 61.48490034;
                  // const sum = Math.sqrt(((x1 - x2) ** 2) + ((y1 - y2) ** 2));
                  // console.log(sum);
                  this.allArrowNodes.push({
                    tag: {
                      dataType: 'image-node',
                      nodeId: `arrow-${i}`,
                      fromOtl: {
                        ...el.data.tag.fromOtl,
                        token_type: `arrow-${el.data.tag.fromOtl.type}`,
                      },
                      arrowWidth,
                      xByArrow,
                      yByArrow,
                    },
                    layout: {
                      x: xByArrow,
                      y: yByArrow,
                    },
                    icon: 'element-21',
                  });
                }
              });
              const result = generateIcons.generateIconNodes(this.allArrowNodes);
              res(result);
            } catch (e) {
              rej(e);
            }
          }))
          .then((arrowNodes) => new Promise((res, rej) => {
            try {
              arrowNodes.forEach((el) => {
                const textNode = {
                  type: 'node',
                  data: {
                    ...this.defaultDescriptionStyles,
                    tag: {
                      ...this.defaultDescriptionStyles.tag,
                      bgColor: {
                        rgbaString: 'rgba(0,0,0,0)',
                        rgbaObject: {
                          r: 0,
                          g: 0,
                          b: 0,
                          a: 0,
                        },
                      },
                      borderColor: {
                        rgbaString: 'rgba(0,0,0,0)',
                        rgbaObject: {
                          r: 0,
                          g: 0,
                          b: 0,
                          a: 0,
                        },
                      },
                      textColor: Utils.generateColor(Color.from('white')),
                    },
                    layout: {
                      ...this.defaultDescriptionStyles.layout,
                      x: el.layout.x,
                      y: el.layout.y - el.layout.height,
                    },
                  },
                };
                this.allArrowNodes.push({
                  ...textNode,
                  data: {
                    ...textNode.data,
                    tag: {
                      ...textNode.data.tag,
                      text: el.tag.fromOtl.distance || '-',
                    },
                    layout: {
                      x: el.tag.xByArrow,
                      y: el.tag.yByArrow
                          - Number(el.tag.arrowWidth / (el.layout.width / el.layout.height)),
                      width: Number(el.tag.arrowWidth),
                      height: Number(el.tag.arrowWidth / (el.layout.width / el.layout.height)),
                    },
                  },
                });
                this.allArrowNodes.push({
                  type: 'node',
                  data: {
                    ...el,
                    layout: {
                      x: el.tag.xByArrow,
                      y: el.tag.yByArrow,
                      width: Number(el.tag.arrowWidth),
                      height: Number(el.tag.arrowWidth / (el.layout.width / el.layout.height)),
                    },
                    icon: el.icon.node.style.image,
                  },
                });
              });
              res();
            } catch (e) {
              rej(e);
            }
          }))
          .then(() => {
            try {
              const allElements = [];
              [
                ...this.allParentNodes,
                ...this.allChildNodes,
                ...this.allEdges,
                ...this.otherNodes,
                ...this.allMetricNodes,
                ...this.allArrowNodes,
              ].forEach((el) => {
                if (el.type === 'node') {
                  allElements.push(el);
                  const textNode = {
                    type: 'node',
                    data: {
                      ...this.defaultDescriptionStyles,
                      tag: {
                        ...this.defaultDescriptionStyles.tag,
                        borderColor: el?.data?.tag?.fromOtl?.color
                          ? Utils.generateColor(Color.from(el.data.tag.fromOtl.color))
                          : this.defaultDescriptionStyles.tag.borderColor,
                        textColor: el?.data?.tag?.fromOtl?.color
                          ? Utils.generateColor(Color.from(el.data.tag.fromOtl.color))
                          : this.defaultDescriptionStyles.tag.textColor,
                      },
                      layout: {
                        ...this.defaultDescriptionStyles.layout,
                        x: el.data.layout.x,
                        y: el.data.layout.y
                            + el.data.layout.height
                            - (this.defaultDescriptionStyles.layout.height / 2),
                      },
                    },
                  };
                  if (el?.data?.tag?.fromOtl?.description
                      && (el?.data?.tag?.nodeId.includes('child')
                          || el?.data?.tag?.nodeId.includes('other'))) {
                    // Element with description
                    allElements.push({
                      ...textNode,
                      data: {
                        ...textNode.data,
                        tag: {
                          ...textNode.data.tag,
                          text: el.data.tag.fromOtl.description,
                        },
                      },
                    });
                  } else if (
                    el?.data?.tag?.fromOtl?.parent_description
                      && el?.data?.tag?.nodeId.includes('parent')
                  ) {
                    // Element with description
                    allElements.push({
                      ...textNode,
                      data: {
                        ...textNode.data,
                        tag: {
                          ...textNode.data.tag,
                          text: el.data.tag.fromOtl.parent_description,
                        },
                      },
                    });
                  }
                } else {
                  allElements.push(el);
                }
              });
              resolve(allElements);
            } catch (e) {
              reject(e);
            }
          });
      } catch (e) {
        reject(e);
      }
    });
  }
}

export default GenerateElementsFromSearch;
