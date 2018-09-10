import DiveInfoTable from './DiveInfoTable.vue';
import {shallowMount} from '@vue/test-utils';
describe('DiveInfoTable', () => {
    let component;
    beforeEach(() => {
        component = shallowMount(DiveInfoTable, {
            slots: {
                footer: '<div id="shrek" />'
            }
        });
    });

    test('it should have a footer slot', () => {
        expect(component.find('#shrek')).toBeDefined();
    });

    test('it should have no content', () => {
        const content = component.find('.card-content');
        expect(content.isEmpty()).toEqual(true);
    });

    test('it should have an empty `propList`', () => {
        expect(component.vm.propList).toEqual([]);
    });

    describe('when given a `dive` object', () => {
        beforeEach(() => {
            component.setProps({
                dive: {
                    foo: 123,
                    bar: 456
                }
            });
        });

        it('should render all props', () => {
            const labels = component
                .findAll('.dit__label')
                .wrappers.map(el => el.text());
            expect(labels).toEqual(['foo', 'bar']);
            const vals = component
                .findAll('.dit__val')
                .wrappers.map(el => el.text());
            expect(vals).toEqual(['123', '456']);
        });

        describe('when given a list of specific `props`', () => {
            beforeEach(() => {
                component.setProps({
                    props: {
                        shrek: 'foo'
                    }
                });
            });

            test('it will only render them', () => {
                const labels = component
                    .findAll('.dit__label')
                    .wrappers.map(el => el.text());
                expect(labels).toEqual(['shrek']);
                const vals = component
                    .findAll('.dit__val')
                    .wrappers.map(el => el.text());
                expect(vals).toEqual(['123']);
            });
        });
    });
});
