
// test компонента dashSingle.vue

window.Vue =  require('vue')
import { enableFetchMocks } from 'jest-fetch-mock'

import { shallowMount} from '@vue/test-utils'
import dashSingle from '../components/dashBoardInside/dashSingle.vue'  // подключаем сам компонент который будем тестировать


// подключаем нужные нам библиотеки 

import store from '../store/index.js' // хранилилище local storage
import  restAuth from '../storeAuth/storeRest.js' // хранилище с эндпоинтами и логами
import vuetify from 'vuetify'  // библотека для красивого отображения элементов
import { mdiHumanGreeting } from '@mdi/js'
Vue.use(vuetify)



// подключаем компоненты, которые нужны для этого компонента

describe('Компонент dashSingle.vue', () => {  // тест самого компонента

  enableFetchMocks() // запускаем заглушки (mock) на fetch

  fetch
    .once(JSON.stringify({data: { id: 16, name: "Banana", body: '', modified: 12342455345, groups: ["Banana Group"]}})) // /api/dash?id=${id}

  store.commit('setDash',{data: {id: 16, name: "Banana", modified: 12342455345,}, getters: store.getters.checkAlreadyDash});  // занесем фиктивный дашборд чтобы все отработало

  store.getters.getElements(16)


  store.commit('createDashBoard', { idDash: 16, dashboard: {
    single: {
      actions: [],
      height: 0,
      left: 0,
      loading: false,
      name_element: 'Single',
      options: {
        boxShadow: false,
        change: false,
        level: 1,
        vissible: true,
      },
      search: -1,
      should: false,
      switch: false,
      top: 0,
      width: 0,
    }
  }});

  store.commit('setEvents', {event: [{
    action: 'set',
    color: '[green,orange,red]',
    event: 'onValueCompare',
    prop: ['color'],
    target: 'single',
    treshold: '[2,4,8]',
    value: ['']
  }] ,eventFull: 'onValueCompare([2,4,8], [green,orange,red],set(single,color))', idDash: 16 });

  
 
  let wrapper = shallowMount(dashSingle, {   // при создании экземпляра объекта vue
    store,    // передаем store (хранилище)
    propsData: {   // эметируем входные параметры
      idFrom: 'single',
      idDashFrom: 16,
      dataRestFrom: [{number: 5}],
      colorFrom: {
        back: '#ffffff',
        backElement: 'white',
        text: '#4a4a4a',
        controls: '#6e96c5',
        controlsSystem: '#004799',
        controlsActive: '#41C4FF',
        controlsInsideDash: '#6e96c5',
        panel: '#2B68B1',
        border: '#00000033',
      }
    },
    //stubs: ['modal-create-search','modal-schedule','dash-settings','modal-paper'] // и делаем заглушки на компоненты которые мы не будем тестировать
  });

  const putLogMock = jest.fn(() => 'add some logs')  // задаем заглушку (mock) который будет имитировать функцию putLog, которая записывает логи
  restAuth.putLog = putLogMock // указываем что при вызове метод putLog на самом деле будет вызвана заглушка
  
  beforeEach(() => {  // перед каждым новым тестом 
    fetch.resetMocks()  // очищаем моки fetch
  })


  it('Меняется цвет в зависимости от порога значения (5)', () => {
    expect(wrapper.vm.number).toBe(5)
    // не смог придумать как протестировать  что computed свойство color меняется
    
    
    
  })


})