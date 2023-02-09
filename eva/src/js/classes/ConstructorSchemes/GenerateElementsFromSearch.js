import {
  Color,
} from 'yfiles';
import GenerateIcons from '@/js/classes/ConstructorSchemes/GenerateIcons';
import Utils from '@/js/classes/ConstructorSchemes/Utils';

class GenerateElementsFromSearch {
  constructor({
    graphComponent,
    elements,
    defaultEdgeStyles,
    defaultDescriptionStyles,
  }) {
    this.graphComponent = graphComponent;
    this.elements = elements;
    this.defaultEdgeStyles = defaultEdgeStyles;
    this.defaultDescriptionStyles = defaultDescriptionStyles;
  }

  generate() {
    const generateIcons = new GenerateIcons();
    const elementsForBuild = [];
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
        generateIcons.generateIconNodes(this.elements).then((response) => {
          if (response?.length > 0) {
            response.forEach((element, index) => {
              const nodeId = element.type
                ? `${element.type}-image-node-${index}`
                : `image-node-${index}`;
              if (element.type === 'parent' || element.type === 'child') {
                if (element.type === 'parent') {
                  edgeTemplate
                    .data
                    .source
                    .port
                    .location
                    .x = Number(element.layout.x);
                  edgeTemplate
                    .data
                    .source
                    .port
                    .location
                    .y = Number(element.layout.y);
                  edgeTemplate.data.source.port.id = `source-port-${index}`;
                  edgeTemplate.data.tag.edgeId = `edge-${index}`;
                  edgeTemplate.data.source.node = {
                    nodeId,
                  };
                } else {
                  elementsForBuild.push({
                    ...edgeTemplate,
                    data: {
                      ...edgeTemplate.data,
                      target: {
                        ...edgeTemplate.data.target,
                        node: {
                          nodeId,
                        },
                        port: {
                          ...edgeTemplate.data.target.port,
                          id: `target-port-${index}`,
                          location: {
                            x: Number(element.layout.x) + (+element.layout.width / 2),
                            y: Number(element.layout.y)
                                + +element.layout.height
                                + this.defaultDescriptionStyles.layout.height,
                          },
                        },
                      },
                    },
                  });
                }
              }
              // Блок с подписью к блоку
              if (element.description) {
                // elementsForBuild.push({
                //   type: 'node',
                //   data: {
                //     tag: {
                //       ...this.defaultDescriptionStyles.tag,
                //       nodeId: `description-node-${index}`,
                //       text: element.description,
                //       borderColor: Utils.generateColor(Color.from(element.color)),
                //       bgColor: Utils.generateColor(Color.from('rgba(60, 59, 69, 1)')),
                //       textColor: Utils.generateColor(Color.from(element.color)).rgbaString,
                //       width: this.defaultDescriptionStyles.layout.width,
                //       height: this.defaultDescriptionStyles.layout.height,
                //     },
                //     layout: {
                //       ...this.defaultDescriptionStyles.layout,
                //       x: Number(element.layout.x) + (+element.layout.width / 2)
                //           - (this.defaultDescriptionStyles.layout.width / 2),
                //       y: Number(element.layout.y + +element.layout.height)
                //           - (this.defaultDescriptionStyles.layout.height / 2),
                //     },
                //   },
                // });
              }
              const filteredObjectFromOtl = {};
              // Удаление поля с нодой
              Object.keys(element).forEach((key) => {
                if (key !== 'icon') {
                  filteredObjectFromOtl[key] = element[key];
                }
              });
              elementsForBuild.push({
                type: 'node',
                data: {
                  tag: {
                    fromOtl: {
                      ...filteredObjectFromOtl,
                    },
                    nodeId,
                    dataType: element.dataType,
                    width: Number(element.layout.width),
                    height: Number(element.layout.height),
                  },
                  icon: element.icon.node.style.image,
                  layout: {
                    ...element.layout,
                    width: Number(element.layout.width * 0.3),
                    height: Number(element.layout.height * 0.3),
                    x: Number(element.layout.x),
                    y: Number(element.layout.y),
                  },
                },
              });
            });
          }
          resolve(elementsForBuild);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
}

export default GenerateElementsFromSearch;
