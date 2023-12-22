import { Color } from 'yfiles';

class Utils {
  constructor(graph) {
    this.graph = graph;
  }

  static generateColor(color, opacity) {
    if (opacity) {
      return {
        hex: Utils.rgbaToHex(Utils.colorToString(Color.from(color), opacity)),
        rgbaObject: Utils.colorToRgbaObject(color, opacity),
        rgbaString: Utils.colorToString(Color.from(color), opacity),
      };
    }
    return {
      hex: Utils.rgbaToHex(Utils.colorToString(Color.from(color), opacity)),
      rgbaObject: Utils.colorToRgbaObject(color),
      rgbaString: Utils.colorToString(Color.from(color), 1),
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

  static rgbaToHex(rgba) {
    const rgbaArray = rgba.match(/\d+/g);

    // Преобразуем числа в формат HEX
    const hex = rgbaArray.map((color, index) => {
      if (index === 3) { // Если это альфа-канал
        const alphaHex = parseInt(color, 10).toString(16);
        return alphaHex.length === 1 ? `0${alphaHex}` : alphaHex;
      }

      const hexValue = parseInt(color, 10).toString(16);
      return hexValue.length === 1 ? `0${hexValue}` : hexValue;
    });

    // Соединяем значения HEX и возвращаем результат
    return `#${hex.slice(0, 3).join('')}${hex[3]}`;
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

  static getDataObject(data) {
    if (data) {
      if (data?.length > 0) {
        const filteredDataItems = data.map((item) => (item?.dataObject
          ? item.dataObject
          : item))
          .filter((item) => {
            if (item) {
              return Utils.isValidDataFields(item);
            }
            return false;
          });
        if (filteredDataItems?.length > 0) {
          return filteredDataItems;
        }
        return [];
      }
      if (Utils.isValidDataFields(data)) {
        return [data];
      }
    }
    return [];
  }

  static isValidDataFields(dataObject) {
    const {
      Description,
      NameObject,
      TagName,
      value,
    } = dataObject;
    const isDescription = typeof Description !== 'undefined';
    const isNameObject = typeof NameObject !== 'undefined';
    const isTagName = typeof TagName !== 'undefined';
    const isValue = typeof value !== 'undefined';
    return isDescription && isNameObject && isTagName && isValue;
  }
}

export default Utils;
