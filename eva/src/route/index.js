// натсройки для переадресации на другие компоненты
import Vue from "vue"
import VueRouter from 'vue-router';

Vue.use(VueRouter);

export default new VueRouter({
  mode: 'history',  // этот мод используется для смены компонентов без перезагрузки страницы
  routes: [
    {
      path: '/',  // если главная страница
      component: require('../components/autorization/autorization.vue').default, 
    },
    {
      path: '/main',  // если главная страница
      component: require('../components/autorization/mainPage.vue').default, 
    },
    {
      path: '/profile/',  // если главная страница
      component: require('../components/autorization/profile.vue').default, 
    },
    {
      path: '/reports',  // если главная страница
      component: require('../components/reports.vue').default, 
    },
    {
      path: '/papers',  // если главная страница
      component: require('../components/papers.vue').default, 
    },
    {
      path: '/dashboards',  // если главная страница
      component: require('../components/mainPageDash.vue').default, 
    },
    {
      path: '/dashboards/:id',  // если страница дашборда
      component: require('../components/mainTitle.vue').default, 
      props: true
    },
    {
      path: '/forms/',  // если страница форм
      component: require('../components/forms/formMain.vue').default, 
    },
    {
      path: '/forms/open/',  // если страница форм
      component: require('../components/forms/formOpen.vue').default,
      props: true, 
    },
    {
      path: '/forms/edit/',  // если страница форм
      component: require('../components/forms/formEdit.vue').default, 
      props: true,
    },
    {
      path: '/forms/openlist/:id',  // если страница форм
      component: require('../components/forms/formOpenList.vue').default, 
    },
    {
      path: '/forms/:id',  // если страница форм
      component: require('../components/forms/formMain.vue').default, 
    },
    {
      path: '*',  // если любая другая в том числе не существующая то
      component: require('../components/notFound.vue').default,
    },
    
  ],
});


