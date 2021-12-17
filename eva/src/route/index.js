// натсройки для переадресации на другие компоненты
import Vue from "vue"
import VueRouter from 'vue-router';
import VueJWT from 'vuejs-jwt';

Vue.use(VueRouter);
Vue.use(VueJWT, { storage: 'cookie', keyName: 'eva_token' });

const routes =  [
  {
    name: 'Авторизация',
    path: '/',  // если главная страница
    component: require('../components/autorization/autorization.vue').default,
  },
  {
    name: 'Главная',
    path: '/main',  // если главная страница
    component: require('../components/autorization/mainPage.vue').default,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Профиль',
    path: '/profile/',  // если главная страница
    component: require('../components/autorization/profile.vue').default,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Репорты',
    path: '/reports',  // если главная страница
    component: require('../components/reports.vue').default,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Документы',
    path: '/papers',  // если главная страница
    component: require('../components/papers.vue').default,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Дашборды',
    path: '/dashboards',  // если главная страница
    component: require('../components/mainPageDash.vue').default,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Дашборд',
    path: '/dashboards/:id',  // если страница дашборда
    component: require('../components/mainTitle.vue').default,
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Дашборд',
    path: '/dashboards/:id/:tabId',  // если страница дашборда
    component: require('../components/mainTitle.vue').default,
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Формы',
    path: '/forms/',  // если страница форм
    component: require('../components/forms/formMain.vue').default,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Открытая форма',
    path: '/forms/open/',  // если страница форм
    component: require('../components/forms/formOpen.vue').default,
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Форма редактирования',
    path: '/forms/edit/',  // если страница форм
    component: require('../components/forms/formEdit.vue').default,
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Список формы',
    path: '/forms/openlist/:id',  // если страница форм
    component: require('../components/forms/formOpenList.vue').default,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Форма',
    path: '/forms/:id',  // если страница форм
    component: require('../components/forms/formMain.vue').default,
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '*',  // если любая другая в том числе не существующая то
    component: require('../components/notFound.vue').default,
  },
];

const router = new VueRouter({
  mode: 'history',
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    if (Vue.$jwt.hasToken()) {
      next();
      return;
    }
    next('/');
  } else {
    next();
  }
});

export default router;

