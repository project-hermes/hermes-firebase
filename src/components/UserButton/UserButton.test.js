import UserButton from './UserButton.vue';
import {shallowMount, createLocalVue} from '@vue/test-utils';
import Vuex from 'vuex';

const localVue = createLocalVue();
localVue.use(Vuex);

describe('UserButton', () => {
    let component;
    let store;
    const signOut = jest.fn();
    beforeEach(() => {
        store = new Vuex.Store({
            modules: {
                auth: {
                    namespaced: true,
                    actions: {
                        signOut
                    },
                    getters: {
                        user: () => ({
                            displayName: 'foo'
                        })
                    }
                }
            }
        });

        component = shallowMount(UserButton, {
            store,
            localVue
        });
    });

    test('it should not be active upon initialization', () => {
        expect(component.vm.isActive).toEqual(false);
    });

    describe('when it is toggled', () => {
        beforeEach(() => {
            component.vm.toggle();
        });

        test('it should be active', () => {
            expect(component.vm.isActive).toEqual(true);
        });

        describe('and toggled again', () => {
            beforeEach(() => {
                component.vm.toggle();
            });

            test('it should not be active', () => {
                expect(component.vm.isActive).toEqual(false);
            });
        });

        describe('and toggled off', () => {
            beforeEach(() => {
                component.vm.toggleOff();
            });

            test('it should not be active', () => {
                expect(component.vm.isActive).toEqual(false);
            });
        });
    });

    describe('signOut', () => {
        test('it should dispatch a signOut action', () => {
            component.vm.signOut();
            expect(signOut).toHaveBeenCalled();
        });
    });
});
