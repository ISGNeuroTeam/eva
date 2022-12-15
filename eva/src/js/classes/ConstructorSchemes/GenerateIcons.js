import { ImageNodeStyle, Rect, SimpleNode } from 'yfiles';

const regexpSize = /viewBox="0 0 (?<width>.*?) (?<height>.*?)"/;

class GenerateIcons {
  constructor({
    maxItemSize,
    minItemSize,
  }) {
    this.maxItemSize = maxItemSize;
    this.minItemSize = minItemSize;
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

  generateIconNodes(iconsList) {
    return GenerateIcons.getIconsListWithSize(iconsList)
      .then((iconsWithSize) => iconsWithSize.map((item) => {
        const imageStyleNode = new SimpleNode();
        try {
          const nodeSize = this.generateImageSize(item.layout);
          imageStyleNode.layout = new Rect(0, 0, +nodeSize.width, +nodeSize.height);
          imageStyleNode.style = new ImageNodeStyle(`/svg/${item.icon}.svg`);
          imageStyleNode.tag = {
            dataType: 'image-node',
            isAspectRatio: true,
          };
          if (item.description) {
            return {
              description: {
                node: imageStyleNode,
                tooltip: 'Элементы с картинкой',
                dataType: 'image-node',
              },
            };
          }
          return {
            icon: {
              node: imageStyleNode,
              tooltip: 'Элементы с картинкой',
              dataType: 'image-node',
            },
          };
        } catch (e) {
          throw new Error(e);
        }
      }));
  }

  generateImageSize({
    width,
    height,
  }) {
    let localWidth = width;
    let localHeight = height;
    if (width === height) {
      if (width < this.minItemSize) {
        localWidth = this.minItemSize;
      }
      if (height < this.minItemSize) {
        localHeight = this.minItemSize;
      }
    }
    const increaseSizeFn = (resultWidth, resultHeight) => {
      if ((this.maxItemSize * 2) < (resultWidth + resultHeight)) {
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
