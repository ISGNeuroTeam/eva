import { ImageNodeStyle, Rect, SimpleNode } from 'yfiles';
import { DragAndDropPanelItem } from '@/js/classes/ConstructorSchemes/DnDPanelClass';

const regexpSize = /viewBox="0 0 (?<width>.*?) (?<height>.*?)"/;

// const regexpSize2 = /viewBox="0 0 (?<width>.*?) (?<height>.*?)"/;

class GenerateIcons {
  constructor({
    maxItemSize,
    minItemSize,
  }) {
    this.maxItemSize = maxItemSize;
    this.minItemSize = minItemSize;
  }

  static getSvgLayoutSize(iconUrl) {
    return fetch(iconUrl)
      .then((response) => response.body)
      .then((rb) => {
        const reader = rb.getReader();

        return new ReadableStream({
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
        });
      })
      .then((stream) => new Response(
        stream,
        {
          headers: {
            'Content-Type': 'text/html',
          },
        },
      ).text())
      .then((svgText) => svgText.match(regexpSize).groups)
      .catch((e) => {
        throw new Error(e);
      });
  }

  generateIconNodes(iconsList) {
    return Promise.all(iconsList.map(async (icon) => {
      const imageStyleNode = new SimpleNode();
      const layout = await GenerateIcons.getSvgLayoutSize(`/svg/${icon}.svg`);
      try {
        const nodeSize = this.generateImageSize(layout);
        imageStyleNode.layout = new Rect(0, 0, +nodeSize.width, +nodeSize.height);
        imageStyleNode.style = new ImageNodeStyle(`/svg/${icon}.svg`);
        imageStyleNode.tag = {
          dataType: 'image-node',
          isAspectRatio: true,
        };
      } catch (e) {
        throw new Error(e);
      }
      return new DragAndDropPanelItem(imageStyleNode, 'Элементы с картинкой', 'image-node');
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
