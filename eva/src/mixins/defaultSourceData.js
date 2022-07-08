import { mdiViewDashboard } from '@mdi/js';

const defaultSourceData = {
  methods: {
    getDefaultValue() {
      const {
        defaultFromSourceData = null,
        defaultSourceDataField = null,
      } = this.dashFromStore.options;
      const fieldName = defaultSourceDataField || 'value';
      if (defaultFromSourceData !== null) {
        const { data = undefined } = this.dataSources[defaultFromSourceData];
        if (data && data.length) {
          const [firstRow] = data;
          const rowKeys = Object.keys(firstRow);
          if (rowKeys.includes(fieldName)) {
            return firstRow[fieldName];
          }
          this.$store.commit('notify/addNotification', {
            id: `defSourceWarn-${this.idFrom}`,
            icon: mdiViewDashboard,
            message: `Поле "${fieldName}" для дефолтного значения из ИД не найдено для компонента ${this.idFrom}`,
          });
        }
      }
      return null;
    },
  },
};

export default defaultSourceData;
