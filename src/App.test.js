import Vue from 'vue';
import App from './App.vue';

describe('App', () => {
    let component, vm;
    beforeEach(() => {
        const routerView = {
            name: 'router-view',
            render: h => h('div')
        };

        Vue.component('router-view', routerView);

        component = Vue.extend(App);
        vm = new component().$mount();
    });

    test('it should exist', () => {
        expect(vm).toBeDefined();
    });
});
