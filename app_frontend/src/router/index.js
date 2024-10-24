import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import DeviceView from '@/views/tableViews/DeviceView.vue'
import UserView from '@/views/tableViews/UserView.vue'
import AddUserView from '@/views/addViews/AddUserView.vue'
import EditUserView from '@/views/editViews/EditUserView.vue'
import AddDeviceView from '@/views/addViews/AddDeviceView.vue'
import EditDeviceView from '@/views/editViews/EditDeviceView.vue'
import NavigationView from '@/views/NavigationView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/nav',
      name: 'navigation',
      component: NavigationView
    },
   {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue')
   },
   {
    path: '/devices',
    name: 'devices',
    component: DeviceView
   },
   {
    path: '/users',
    name: 'users',
    component: UserView
   },
   {
    path: '/user/add',
    name: 'user_add',
    component: AddUserView
   },
   {
    path: '/user/edit/:id',
    name: 'user_edit',
    component: EditUserView
   },
   {
    path: '/device/add',
    name: 'device_add',
    component: AddDeviceView
   },
   {
    path: '/device/edit/:id',
    name: 'device_edit',
    component: EditDeviceView
   },
   {
    path: '/:pathMatch(.*)*',
    component: NotFoundView
   }
  ]
})

export default router
