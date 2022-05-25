// натсройки для переадресации на другие компоненты
import Vue from 'vue';
import VueRouter from 'vue-router';
import VueJWT from 'vuejs-jwt';

Vue.use(VueRouter);
Vue.use(VueJWT, { storage: 'cookie', keyName: 'eva_token' });

const routes = [
  {
    name: 'Авторизация',
    path: '/', // если главная страница
    component: () => import('../components/autorization/autorization.vue'),
  },
  {
    name: 'Главная',
    path: '/main', // если главная страница
    component: () => import('../components/autorization/mainPage.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Профиль',
    path: '/profile/', // если главная страница
    component: () => import('../components/autorization/profile.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Исследование данных',
    path: '/data-research', // если главная страница
    component: () => import('../components/reportsV2/index.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Дашборды',
    path: '/dashboards', // если главная страница
    component: () => import('../components/mainPageDash.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Дашборд',
    path: '/dashboards/:id', // если страница дашборда
    component: () => import('../components/mainTitle.vue'),
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Дашборд tab',
    path: '/dashboards/:id/:tabId', // если страница дашборда
    component: () => import('../components/mainTitle.vue'),
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Формы',
    path: '/forms/', // если страница форм
    component: () => import('../components/forms/formMain.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Открытая форма',
    path: '/forms/open/', // если страница форм
    component: () => import('../components/forms/formOpen.vue'),
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Форма редактирования',
    path: '/forms/edit/', // если страница форм
    component: () => import('../components/forms/formEdit.vue'),
    props: true,
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Список формы',
    path: '/forms/openlist/:id', // если страница форм
    component: () => import('../components/forms/formOpenList.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    name: 'Форма',
    path: '/forms/:id', // если страница форм
    component: () => import('../components/forms/formMain.vue'),
    meta: {
      requiresAuth: true,
    },
  },
  {
    path: '*', // если любая другая в том числе не существующая то
    component: () => import('../components/notFound.vue'),
  },
];

const router = new VueRouter({
  mode: 'history',
  base: '/eva/',
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
