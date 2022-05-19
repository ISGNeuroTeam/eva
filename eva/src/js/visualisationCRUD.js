import store from '@/store'
export default {
  create({element, spaceName, idDash}) {
    // функция создания нового элемнета
    if (element) {
      const type = element // и его тип (table, select and etc)


      // Создаем новый элемнет на дашборде (стандартные настройки любого элемента)
      const newVisualisation = {[type]: {
        name_elem: type[0].toUpperCase() + type.substring(1), 
        should: false,
        search: -1,
        switch: false,
        actions: []
      }}


      store.commit('createDashboardVisualization', {
        idDash: idDash,
        dashboard: newVisualisation,
        spaceName: spaceName
      }) // создаем новый элемнет

      return store.state[idDash][`elements${spaceName}`].at(-1)
    }
  },
  delete({idDash, id, name, spaceName}) {
    store.commit('deleteDashboardVisualization', {
      idDash,
      id,
      page: 'dash',
      name,
      spaceName
    });
  }
}
