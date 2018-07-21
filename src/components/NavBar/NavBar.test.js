import NavBar from './NavBar.vue';
import {shallowMount, createLocalVue} from '@vue/test-utils';
import Vuex from 'vuex';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('NavBar', () => {
    let component;
    let store;
    const toggle = jest.fn();
    beforeEach(() => {
        store = new Vuex.Store({
            modules: {
                nav: {
                    namespaced: true,
                    actions: {
                        toggle
                    },
                    getters: {
                        isToggled: () => true
                    }
                }
            }
        });

        component = shallowMount(NavBar, {
            store,
            localVue,
            stubs: ['router-link'],
            mocks: {
                $route: {}
            }
        });
    });

    test('is should have computed prop `isToggled`', () => {
        expect(component.vm.isToggled).toEqual(true);
    });
});
