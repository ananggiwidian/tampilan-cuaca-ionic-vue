import { createRouter, createWebHistory } from '@ionic/vue-router';
import HomePage from '../components/homePage.vue';
import SimpleView from '../components/SimpleView.vue';

const routes = [
  { path: '/', component: HomePage },
  { path: '/simple', component: SimpleView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;