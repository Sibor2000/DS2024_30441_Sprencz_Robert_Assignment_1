import { createRouter, createWebHistory } from 'vue-router'
import VueCookies from "vue-cookies"
import HomeView from '../views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import DeviceView from '@/views/tableViews/DeviceView.vue'
import UserView from '@/views/tableViews/UserView.vue'
import AddUserView from '@/views/addViews/AddUserView.vue'
import EditUserView from '@/views/editViews/EditUserView.vue'
import AddDeviceView from '@/views/addViews/AddDeviceView.vue'
import EditDeviceView from '@/views/editViews/EditDeviceView.vue'
import NavigationView from '@/views/NavigationView.vue'
import ForbiddenView from '@/views/ForbiddenView.vue'
import MonitorChartView from '@/views/MonitorChartView.vue'
import UserCalendarView from '@/views/UserCalendarView.vue'
import UserConsumptionView from '@/views/UserConsumptionView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { noAuth: true }
    },
    {
      path: '/nav',
      name: 'navigation',
      component: NavigationView
    },
   {
    path: '/login',
    name: 'login',
    meta: { noAuth: true },
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
    path: '/device/monitor_chart/:id',
    name: 'device_monitor_chart',
    component: MonitorChartView
   },
   {
    path:'/user_calendar',
    name: 'user_calendar',
    component: UserCalendarView
   },
   {
    path:'/user/monitor_chart/:id',
    name:'user_consumption',
    component: UserConsumptionView
   },
   {
    path: '/:pathMatch(.*)*',
    component: NotFoundView
   },
   {
    path: '/403',
    component: ForbiddenView,
    meta: { noAuth: true },
    name: "Forbidden"
   }
  ]
})

router.beforeEach((to,from,next)=>{
  //return next();

  if(to.meta.noAuth || VueCookies.get("token")){
    return next();
  }

  return next({name: "Forbidden"});
})

export default router
