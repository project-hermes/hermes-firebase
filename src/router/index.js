import Vue from 'vue';
import VueRouter from 'vue-router';
import {
    Dives,
    DiveList,
    MapView,
    ChartView,
    Demo,
    SignIn,
    NavView,
    SignUp,
    MainView,
    DiveDetails
} from '~/pages';
import store from '~/store';
Vue.use(VueRouter);
const readyPromise = store.getters['auth/readyPromise'];
const router = new VueRouter({
    mode: 'history',
    routes: [
        {
            path: '/sign-in',
            name: 'signIn',
            component: SignIn,
            beforeEnter: (to, from, next) => {
                const isAuthorized = store.getters['auth/isAuthorized'];
                if (isAuthorized) {
                    return next('/dives');
                }
                next();
            }
        },
        {
            path: '/sign-up',
            name: 'signUp',
            component: SignUp
        },
        {
            path: '/',
            component: NavView,
            meta: {
                requiresAuth: true
            },
            children: [
                {
                    path: '/',
                    name: 'main',
                    component: MainView
                },
                {
                    path: '/quick',
                    component: Dives
                },
                {
                    path: '/dives',
                    name: 'dives',
                    component: DiveList
                },
                {
                    path: '/dives/:id',
                    name: 'diveDetails',
                    component: DiveDetails,
                    props: true
                },
                {
                    path: '/map',
                    component: MapView
                },
                {
                    path: '/charts',
                    component: ChartView
                },
                {
                    path: '/demo',
                    component: Demo
                }
            ]
        }
    ]
});

router.beforeEach((to, from, next) => {
    readyPromise.then(() => {
        const isAuthorized = store.getters['auth/isAuthorized'];
        const requiresAuth = to.matched.some(
            record => record.meta.requiresAuth
        );
        if (requiresAuth && !isAuthorized) {
            next('/sign-in');
        } else {
            next();
        }
    });
});

export default router;
