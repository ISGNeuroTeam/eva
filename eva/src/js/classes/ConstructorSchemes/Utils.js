import { Color } from 'yfiles';

class Utils {
  constructor(graph) {
    this.graph = graph;
  }

  static generateColor(color) {
    return {
      // For correct work with vuetify color-picker
      rgbaObject: Utils.colorToRgbaObject(color),
      rgbaString: Utils.colorToString(Color.from(color)),
    };
  }

  static colorToString({
    r, g, b, a,
  }) {
    if (a) {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  }

  static colorToRgbaObject(color) {
    const {
      r, g, b, a,
    } = Color.from(color);
    return {
      r, g, b, a,
    };
  }
}

export default Utils;
