
// test компонента reports.vue

window.Vue =  require('vue')

import { shallowMount} from '@vue/test-utils'
import Report from '../components/reports.vue'  // подключаем сам компонент который будем тестировать


// подключаем нужные нам библиотеки 

import store from '../store/index.js' // хранилилище local storage
import vuetify from 'vuetify'  // библотека для красивого отображения элементов
Vue.use(vuetify)

// подключаем компоненты, которые нужны для этого компонента

describe('Компонент reports.vue', () => {  // тест самого компонента


  store.commit('createReportSearch'); // дело в том, что чтобы работали остальные компоненты, сперва нужно добавить объект reports в store


  let wrapper = shallowMount(Report, { 
    store,
    stubs: ['header-top','dash-table','dash-guntt','dash-graph',
      'dash-lineChart','dash-multiLine','dash-barchart',
      'dash-tile','dash-csvg','modal-report','router-link','footer-bottom']
  });



  it('Меняется параметр на основе которого откроется модальное окно с настройками', () => {
    wrapper.vm.$emit("openSettings")
    wrapper.vm.openSettings()
    expect(wrapper.vm.modal).toBe(true)
  })

  it('Получает элементы для отображения визуализаций', () => {
    expect(wrapper.vm.elements).toHaveLength(6)
  })

})