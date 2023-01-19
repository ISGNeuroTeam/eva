import { ImageNodeStyle, Rect, SimpleNode } from 'yfiles';

const regexpSize = /viewBox="0 0 (?<width>.*?) (?<height>.*?)"/;

class GenerateIcons {
  constructor(
    tooltip = 'Элементы с картинкой',
    dataType = 'image-node',
  ) {
    this.tooltip = tooltip;
    this.dataType = dataType;
  }

  // Получаем изображения с сервера, отсеивая некорректные
  static getImagesFromServer(iconsList) {
    const resultList = [];
    return Promise.all(iconsList.map(async (item) => {
      const response = await fetch(`/svg/${item.icon}.svg`);
      if (response.ok) {
        resultList.push({
          ...item,
          response,
        });
      }
    })).then(() => resultList);
  }

  static getSvgLayoutSize(iconFromServer) {
    return new Promise((resolve) => {
      const reader = iconFromServer.getReader();
      resolve(reader);
    })
      .then((reader) => new ReadableStream({
        start(controller) {
          // The following function handles each data chunk
          function push() {
            // "done" is a Boolean and value a "Uint8Array"
            reader.read()
              .then(({ done, value }) => {
                // If there is no more data to read
                if (done) {
                  controller.close();
                  return;
                }
                // Get the data and send it to the browser via the controller
                controller.enqueue(value);
                push();
              });
          }

          push();
        },
      }))
      .then((stream) => new Response(
        stream,
        {
          headers: {
            'Content-Type': 'text/html',
          },
        },
      ).text())
      .then((svgText) => svgText.match(regexpSize).groups);
  }

  static getIconsListWithSize(iconsList) {
    return GenerateIcons.getImagesFromServer(iconsList)
    // Получаем массив загруженых иконок в виде { icon, description, response }
      .then((responseIconsList) => Promise.all(responseIconsList.map(async (item) => {
        const layout = await GenerateIcons.getSvgLayoutSize(item.response.body);
        return {
          icon: item.icon,
          description: item.description,
          layout,
        };
      })).then((resultList) => resultList));
  }

  generateIconNodes(iconsList, maxItemSize, minItemSize) {
    return GenerateIcons.getIconsListWithSize(iconsList)
      .then((iconsWithSize) => iconsWithSize.map((item) => {
        const imageStyleNode = GenerateIcons.getIconNode({
          data: {
            ...item,
            tag: {
              ...item.tag,
              dataType: item?.tag?.dataType || this.dataType,
            },
          },
          maxItemSize,
          minItemSize,
        });
        return {
          description: item.description,
          icon: {
            node: imageStyleNode,
            tooltip: this.tooltip,
            dataType: this.dataType,
          },
        };
      }));
  }

  static getIconNode({
    data,
    size,
    maxItemSize,
    minItemSize,
  }) {
    const imageStyleNode = new SimpleNode();
    const nodeSize = size || GenerateIcons.generateImageSize({
      ...data.layout,
      maxItemSize,
      minItemSize,
    });
    imageStyleNode.layout = new Rect(0, 0, +nodeSize.width, +nodeSize.height);
    imageStyleNode.style = new ImageNodeStyle(`/svg/${data.icon}.svg`);
    imageStyleNode.tag = {
      dataType: data.tag.dataType,
      isAspectRatio: true,
    };
    return imageStyleNode;
  }

  static generateImageSize({
    width,
    height,
    maxItemSize,
    minItemSize,
  }) {
    let localWidth = width;
    let localHeight = height;
    if (width === height) {
      if (width < minItemSize) {
        localWidth = minItemSize;
      }
      if (height < minItemSize) {
        localHeight = minItemSize;
      }
    }
    const increaseSizeFn = (resultWidth, resultHeight) => {
      if ((maxItemSize * 2) < (resultWidth + resultHeight)) {
        return increaseSizeFn(+resultWidth / 2, +resultHeight / 2);
      }
      return {
        width: +resultWidth,
        height: +resultHeight,
      };
    };
    return increaseSizeFn(localWidth, localHeight);
  }
}

export default GenerateIcons;
