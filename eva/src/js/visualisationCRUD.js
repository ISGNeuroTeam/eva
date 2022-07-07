import store from '@/store';

export default {
  create({ element, spaceName, idDash }) {
    // Создаем новый элемнет на дашборде (стандартные настройки любого элемента)
    const newVisualisation = {
      [element]: {
        name_elem: element[0].toUpperCase() + element.substring(1),
        should: false,
        search: -1,
        switch: false,
        actions: [],
      },
    };

    store.commit('createDashboardVisualization', {
      idDash,
      dashboard: newVisualisation,
      spaceName,
    }); // создаем новый элемнет

    return store.state[idDash][`elements${spaceName}`].at(-1);
  },
  delete({
    idDash, id, name, spaceName,
  }) {
    store.commit('deleteDashboardVisualization', {
      idDash,
      id,
      page: 'dash',
      name,
      spaceName,
    });
  },
};
