
// test компонента papers.vue

window.Vue =  require('vue')
import { enableFetchMocks } from 'jest-fetch-mock'

import { shallowMount} from '@vue/test-utils'
import Paper from '../components/papers.vue'  // подключаем сам компонент который будем тестировать


// подключаем нужные нам библиотеки 

import store from '../store/index.js' // хранилилище local storage
import  rest from '../store/storeRest.js' // основное хранилище с эндпоинтами и логами
import storeAuth from '../storeAuth/index.js' // подключаем файл с настройками хранилища Vuex (авторизация)
import  restAuth from '../storeAuth/storeRest.js' // хранилище с эндпоинтами и логами
import vuetify from 'vuetify'  // библотека для красивого отображения элементов
Vue.use(vuetify)
store.auth = storeAuth

// подключаем компоненты, которые нужны для этого компонента

describe('Компонент papers.vue', () => {  // тест самого компонента

  enableFetchMocks() // запускаем заглушки (mock) на fetch
  store.commit('createPaperSearch');  // дело в том, что чтобы работали остальные компоненты, сперва нужно добавить объект papers в store


  let wrapper = shallowMount(Paper, {   // при создании экземпляра объекта vue
    store,    // передаем store (хранилище)
    stubs: ['header-top','modal-report','footer-bottom'] // и делаем заглушки на компоненты которые мы не будем тестировать
  });

  const putLogMock = jest.fn(() => 'add some logs')  // задаем заглушку (mock) который будет имитировать функцию putLog, которая записывает логи
  restAuth.putLog = putLogMock // указываем что при вызове метод putLog на самом деле будет вызвана заглушка

  beforeEach(() => {  // перед каждым новым тестом 
    fetch.resetMocks()  // очищаем моки fetch
  })

  it ('Загрузить файл на сервер',  async () => {

    expect(putLogMock()).toBe("add some logs"); // ставим заглушку на функцию записи логов и проверяем что она отработала корреткно

    wrapper.setData({ uploadFile: 'test.csv' }) // заносим файл имитируя выбор файла пользователем
    fetch
      .once(JSON.stringify({ status: 'success' })) // имитируем fetch запрос который вернет нужный объект,  loadPaper

    await wrapper.vm.setPaper()  // запускаем функцию отправки файла на бэк


    expect(wrapper.vm.errorMsg).toBe('Файл успшено загружен') // првоеряем что сообщение поменялось на успешное


  })

  it('При выполнении запроса и успешного получения данных должен поменяться статус второго кружочка', async () => {

    wrapper.setData({ search: {   // заносим фиктивный запрос в соответсвующию переменную
      original_otl: "| inputlookup papersdata.csv",
      sid: 1967812393,
      parametrs: {
        cache_ttl: 100,
        field_extraction: false,
        preview: false,
        timeout: 100,
        twf: 0,
        tws: 0,
        username: "admin"
      }
    }});
    
    fetch
      .once(JSON.stringify({ status: 'success' }))  // makejob
      .once(JSON.stringify({ status: 'success', cid: 16 })) // checkjob
      .once(JSON.stringify({ status: 'success', data_urls: ['some/direct/data.json','some/shema/_SCHEMA'] }))  // getresult
    
    await wrapper.vm.launchSearch()  // запускаем функцию отправки файла на бэк 
    expect(wrapper.vm.steps['2'].complete).toBe(true) 
    
  })
  
  it('При выборе файла и подтверждения выбора должен поменяться статус третьего кружочка', async () => {
    wrapper.setData({ selectedFile: 'test.csv'}) // заносим в переменную фиктивный файл
    wrapper.vm.choosePaper()  // запускаем метод выбора файла
    expect(wrapper.vm.steps['3'].complete).toBe(true) 

    // так как предыдущие тесты прошли успешно то автоматом запустился метод getPaper

    fetch
      .once(JSON.stringify({ 
        status: 'success', 
        file: 'some/link.zip', 
        html: ['some image','anothe some img'], 
        names: ['some name file', 'another some name file'] 
      }))  // getPaper

    await wrapper.vm.getPaper()   // запускаем метод обработки файла

    expect(wrapper.vm.steps['4'].complete).toBe(true) 
    expect(wrapper.vm.fileLink).toBe('some/link.zip')
    expect(wrapper.vm.tabs).toEqual(['some name file', 'another some name file'])
    expect(wrapper.vm.html).toEqual(['some image','anothe some img'])
  })





})