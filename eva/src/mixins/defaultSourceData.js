const defaultSourceData = {
  methods: {
    getDefaultValue() {
      const {
        defaultFromSourceData = null,
        defaultSourceDataField = null,
      } = this.dashFromStore.options;
      const fieldName = defaultSourceDataField || 'value';
      console.log(this.idFrom, { defaultFromSourceData })
      if (defaultFromSourceData !== null) {
        const { data = undefined } = this.dataSources[defaultFromSourceData];
        if (data && data.length) {
          const [firstRow] = data;
          const rowKeys = Object.keys(firstRow);
          if (rowKeys.includes(fieldName)) {
            return firstRow[fieldName];
          }
        }
      }
      return null;
    },
  },
};

export default defaultSourceData;
