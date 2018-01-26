import Vue from 'vue';
import VueRouter from 'vue-router';
import store from './store';
import Home from './pages/Home/';
import Local from './pages/Home/Local';
import Create from './pages/Home/Create';

const router = new VueRouter({
    routes: [{
        path: '/',
        name: 'Home',
        component: Home,
        children: [{
            path: '',
            name: 'Local',
            alias: 'local',
            component: Local,
        }, {
            path: 'create',
            name: 'Create',
            component: Create,
        }]
    }]
});

Vue.use(VueRouter);

router.beforeEach((to, from, next) => {
    if (to.meta.requireAuth) {
        let user = store.getters.user();
        if (user) {
            if (to.meta.requireAdmin && user.role != "admin") {
                // next();
            } else {
                next();
            }
        } else {
            next({
                path: '/login',
                query: {
                    redirect: to.fullPath
                }
            });
        }
    } else {
        next();
    }
});

export default router;