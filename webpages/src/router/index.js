import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/allSurveys.vue')
    },
    {
      path: '/survey/:id',
      name: 'survey',
      component: () => import('../views/survey.vue')
    },
    {
      path: '/survey/',
      name: 'new-survey',
      component: () => import('../views/newSurvey.vue')
    },
  ]
})

export default router
