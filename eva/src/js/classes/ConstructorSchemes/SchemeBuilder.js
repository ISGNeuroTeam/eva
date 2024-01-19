class SchemeBuilder {
  graph = null;

  data = [];

  parentElements = [];

  childElements = [];

  edges = [];

  constructor(graph, { data }) {
    this.graph = graph;
    this.data = data;
  }

  prepareElements() {
    const result = this.dataParser();
    console.log(result);
  }

  /*
* {
    "__well_num": "1113",
    "well_type": "Нефтяные",
    "well_condition": "В бездействии текущего года",
    "__pad_num": "14",
    "x": 73.92059086,
    "y": 59.08585085,
    "_time": 1703617200,
    "adku_debit": 0,
    "prevX": 0,
    "type": "OIL",
    "icon": "oil_well",
    "parent_icon": "GZU_a_1",
    "parent_capture": "__well_num, well_condition, well_type, collection, department",
    "child_capture": "_time, day, type",
    "edge_color": "red",
    "target_port_constraint": "NORTH",
    "source_port_constraint": "ANY",
    "description_1": "-",
    "description_1_fontSize": "24",
    "description_1_textColor": "white",
    "description_1_borderColor": "white",
    "description_2": "Скв: 1113",
    "description_2_fontSize": "20",
    "description_2_textColor": "white",
    "description_2_borderColor": "white",
    "description_2_value1": "1113",
    "parent_description_1": "ГЗУ",
    "parent_description_1_textColor": "white",
    "parent_description_1_borderColor": "white",
    "parent_description_1_value1": "ГЗУ",
    "distance": "",
    "other_value3": ""
} */
  dataParser() {
    const prefixes = {
      parent: 'parent',
    };
    const result = {};
    const parentElTemplate = {
      type: '',
      icon: '',
      captures: [],
      children: [],
    };
    const childElTemplate = {
      type: '',
      icon: '',
      captures: [],
      x: '',
    };
    const edgeElTemplate = {
      type: '',
      from: '',
      to: '',
      color: '',
    };
    const descriptionElTemplate = {
      text: '',
      fontSize: '',
      textColor: '',
      borderColor: '',
      values: [],
    };
    console.log(this.data.length);
    const sortedData = this.data.sort((a, b) => {
      const textA = a.type.toUpperCase();
      const textB = b.type.toUpperCase();
      if (textA < textB) {
        return -1;
      }
      if (textA > textB) {
        return 1;
      }
      return 0;
    });
    for (let i = 0; i < sortedData.length; i += 1) {
      const dataElem = sortedData[i];
      // console.log(dataElem);
    }
    return result;
  }
}

export default SchemeBuilder;
