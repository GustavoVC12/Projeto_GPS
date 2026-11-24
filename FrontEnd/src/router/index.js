import { createRouter, createWebHistory } from 'vue-router'
import CatalogView from '../views/CatalogView.vue'
import CollectionsView from '../views/CollectionsView.vue'
import HomeView from '../views/HomeView.vue'
import RecommenderView from '../views/RecommenderView.vue'
import CollectionSetView from '../views/CollectionSetView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/catalogo', name: 'catalog', component: CatalogView },
    { path: '/colecoes', name: 'collections', component: CollectionsView },
    { path: '/colecoes/expansao/:setId', name: 'collection-set', component: CollectionSetView, props: true },
    { path: '/recomendacoes', name: 'recommendations', component: RecommenderView },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
