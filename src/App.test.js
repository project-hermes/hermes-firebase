import App from './App.vue';
import {shallowMount} from '@vue/test-utils';
describe('App', () => {
    let component;
    beforeEach(() => {
        component = shallowMount(App, {
            stubs: ['router-view']
        });
    });

    test('it should exist', () => {
        expect(component.exists()).toEqual(true);
    });
});
