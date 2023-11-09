import { Color } from 'yfiles';

class Utils {
  constructor(graph) {
    this.graph = graph;
  }

  static generateColor(color, opacity) {
    if (opacity) {
      return {
        // For correct work with vuetify color-picker
        rgbaObject: Utils.colorToRgbaObject(color, opacity),
        rgbaString: Utils.colorToString(Color.from(color), opacity),
      };
    }
    return {
      // For correct work with vuetify color-picker
      rgbaObject: Utils.colorToRgbaObject(color),
      rgbaString: Utils.colorToString(Color.from(color)),
    };
  }

  static colorToString({
    r, g, b, a,
  }, opacity) {
    if (opacity) {
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    if (a) {
      return `rgba(${r}, ${g}, ${b}, ${a})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  }

  static colorToRgbaObject(color, opacity) {
    const {
      r, g, b, a,
    } = Color.from(color);
    if (opacity) {
      return {
        r, g, b, opacity,
      };
    }
    return {
      r, g, b, a,
    };
  }

  static removeClass(e, className) {
    const classes = e.getAttribute('class');
    if (classes !== null && classes !== '') {
      if (classes === className) {
        e.setAttribute('class', '');
      } else {
        const result = classes
          .split(' ')
          .filter((s) => s !== className)
          .join(' ');
        e.setAttribute('class', result);
      }
    }
    return e;
  }

  static addClass(e, className) {
    const classes = e.getAttribute('class');
    if (classes === null || classes === '') {
      e.setAttribute('class', className);
    } else if (!Utils.hasClass(e, className)) {
      e.setAttribute('class', `${classes} ${className}`);
    }
    return e;
  }

  static hasClass(e, className) {
    const classes = e.getAttribute('class') || '';
    const r = new RegExp(`\\b${className}\\b`, '');
    return r.test(classes);
  }

  static deleteFieldsFromObject(object, fieldsForDelete) {
    const result = {};
    Object.keys(object).forEach((key) => {
      if (!fieldsForDelete.includes(key)) {
        result[key] = object[key];
      }
    });
    return result;
  }

  static getDataItemById(dataRest, dataId) {
    return dataRest.find((dataItem) => dataItem.TagName === dataId);
  }

  static isValidValue(value) {
    return typeof value === 'string' || typeof value === 'number';
  }
}

export default Utils;
