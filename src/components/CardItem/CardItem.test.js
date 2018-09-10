import CardItem from './CardItem.vue';
import {shallowMount} from '@vue/test-utils';
describe('CardItem', () => {
    let component;
    beforeEach(() => {
        component = shallowMount(CardItem, {
            slots: {
                default: '<div id="shrek" />'
            }
        });
    });

    test('it should have a default slot', () => {
        expect(component.find('#shrek')).toBeDefined();
    });
});
