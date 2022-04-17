/* ============
 * Routes File
 * ============
 *
 * The routes and redirects are defined in this file.
 */

export default [
  // 홈
  {
    path: '/',
    name: 'home.index',
    component: () => import('@/views/Home/Index.vue'),
  },

  // 다가오는 일정
  {
    path: '/todolist',
    name: 'todolist.index',
    component: () => import('@/views/Todolist/Index.vue'),
  },

  // 추천 일정
  {
    path: '/reclist',
    name: 'reclist.index',
    component: () => import('@/views/Reclist/Index.vue'),
  },

  // 완료 일정
  {
    path: '/completelist',
    name: 'completelist.index',
    component: () => import('@/views/Completelist/Index.vue'),
  },

  // 모든 일정
  {
    path: '/alllist',
    name: 'alllist.index',
    component: () => import('@/views/Alllist/Index.vue'),
  },

  // 글쓰기 화면
  {
    path: '/write',
    name: 'write.index',
    component: () => import('@/views/Write/Index.vue'),
  },

  // 게시글 보기 화면
  {
    path: '/post',
    name: 'post.index',
    component: () => import('@/views/Post/Index.vue'),
  },

  // 환경설정
  {
    path: '/setting',
    name: 'setting.index',
    component: () => import('@/views/Setting/Index.vue'),
  },

  // Account
  {
    path: '/account',
    name: 'account.index',
    component: () => import('@/views/Account/Index.vue'),

    // If the user needs to be authenticated to view this page.
    meta: {
      auth: true,
    },
  },

  // Register
  {
    path: '/register',
    name: 'register.index',
    component: () => import('@/views/Register/Index.vue'),

    // If the user needs to be a guest to view this page.
    meta: {
      guest: true,
    },
  },

  {
    path: '/',
    redirect: '/home',
  },

  {
    path: '/*',
    redirect: '/home',
  },
];
