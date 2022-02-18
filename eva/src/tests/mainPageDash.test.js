
// test компонента mainPageDash.vue

window.Vue =  require('vue')
import { enableFetchMocks } from 'jest-fetch-mock'

import { shallowMount} from '@vue/test-utils'
import mainPageDash from '../components/mainPageDash.vue'  // подключаем сам компонент который будем тестировать


// подключаем нужные нам библиотеки

import store from '../store/index.js' // хранилилище local storage
import  restAuth from '../store/storeAuth/storeRest.js' // хранилище с эндпоинтами и логами
import vuetify from 'vuetify'  // библотека для красивого отображения элементов
Vue.use(vuetify)



// подключаем компоненты, которые нужны для этого компонента

describe('Компонент mainPageDash.vue', () => {  // тест самого компонента

  enableFetchMocks() // запускаем заглушки (mock) на fetch

  // fetch
  //   .once(JSON.stringify({data: { id: 16, name: "Banana", body: '', modified: 12342455345, groups: ["Banana Group"]}})) // /api/dash?id=${id}

  // store.commit('setDash',{data: {id: 16, name: "Banana", modified: 12342455345}, getters: store.getters.checkAlreadyDash});  // занесем фиктивный дашборд чтобы все отработало



  let wrapper = shallowMount(mainPageDash, {   // при создании экземпляра объекта vue
    store,    // передаем store (хранилище)
    // propsData: {   // эметируем входные параметры
    //   permissionsFrom: ['admin_all','editdash'],
    // },
    stubs: ['header-top','modal-exim','modal-create','modal-delete-main','footer-bottom'] // и делаем заглушки на компоненты которые мы не будем тестировать
  });

  const putLogMock = jest.fn(() => 'add some logs')  // задаем заглушку (mock) который будет имитировать функцию putLog, которая записывает логи
  restAuth.putLog = putLogMock // указываем что при вызове метод putLog на самом деле будет вызвана заглушка

  beforeEach(() => {  // перед каждым новым тестом
    fetch.resetMocks()  // очищаем моки fetch
  })


  it('Меняется доступ к функциям в зависимости от permission ( "managedash",)', () => {
    wrapper.vm.setPermissions(["managedash"])
    expect(wrapper.vm.editDashPermission).toBe(true)
    expect(wrapper.vm.editGroupPermission).toBe(false)
  })

  it('Меняется доступ к функциям в зависимости от permission ( "managegroup")', () => {
    wrapper.vm.setPermissions(["managegroup"])
    expect(wrapper.vm.editDashPermission).toBe(false)
    expect(wrapper.vm.editGroupPermission).toBe(true)
  })

  it('Меняется доступ к функциям в зависимости от permission ( "admin_all")', () => {
    wrapper.vm.setPermissions(["admin_all"])
    expect(wrapper.vm.editDashPermission).toBe(true)
    expect(wrapper.vm.editGroupPermission).toBe(true)
  })

  it('Меняется доступ к функциям в зависимости от permission ([])', () => {
    wrapper.vm.setPermissions([])
    expect(wrapper.vm.editDashPermission).toBe(false)
    expect(wrapper.vm.editGroupPermission).toBe(false)
  })


})
