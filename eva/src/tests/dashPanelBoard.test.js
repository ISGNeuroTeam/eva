
// test компонента dashPanelBoard.vue

window.Vue =  require('vue')
import { enableFetchMocks } from 'jest-fetch-mock'

import { shallowMount} from '@vue/test-utils'
import dashPanelBoard from '../components/dashPanelBoard.vue'  // подключаем сам компонент который будем тестировать


// подключаем нужные нам библиотеки 

import store from '../store/index.js' // хранилилище local storage
import  restAuth from '../storeAuth/storeRest.js' // хранилище с эндпоинтами и логами
import vuetify from 'vuetify'  // библотека для красивого отображения элементов
Vue.use(vuetify)



// подключаем компоненты, которые нужны для этого компонента

describe('Компонент dashPanelBoard.vue', () => {  // тест самого компонента

  enableFetchMocks() // запускаем заглушки (mock) на fetch

  fetch
    .once(JSON.stringify({data: { id: 16, name: "Banana", body: '', modified: 12342455345, groups: ["Banana Group"]}})) // /api/dash?id=${id}

  store.commit('setDash',{data: {id: 16, name: "Banana", modified: 12342455345}, getters: store.getters.checkAlreadyDash});  // занесем фиктивный дашборд чтобы все отработало

 
 
  let wrapper = shallowMount(dashPanelBoard, {   // при создании экземпляра объекта vue
    store,    // передаем store (хранилище)
    propsData: {   // эметируем входные параметры
      permissionsFrom: ['admin_all','editdash'],
      idDashFrom: 16,
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
    stubs: ['modal-create-search','modal-schedule','dash-settings','modal-paper'] // и делаем заглушки на компоненты которые мы не будем тестировать
  });

  const putLogMock = jest.fn(() => 'add some logs')  // задаем заглушку (mock) который будет имитировать функцию putLog, которая записывает логи
  restAuth.putLog = putLogMock // указываем что при вызове метод putLog на самом деле будет вызвана заглушка

  beforeEach(() => {  // перед каждым новым тестом 
    fetch.resetMocks()  // очищаем моки fetch
  })


  it('Меняется отображение в зависимости от permission ("admin_all", "editdash")', () => {
    expect(wrapper.vm.editPermission).toBe(true)
  })

  it('Меняется отображение в зависимости от permission ("editdash")', () => {
    wrapper.setProps({ permissionsFrom: ["editdash"] })
    expect(wrapper.vm.editPermission).toBe(true)
  })

  it('Меняется отображение в зависимости от permission ([])', () => {
    wrapper.setProps({ permissionsFrom: [] })
    expect(wrapper.vm.editPermission).toBe(false)
  })




})