import DiveAnalyticsTable from './DiveAnalyticsTable.vue';
import {shallowMount} from '@vue/test-utils';
describe('DiveAnalyticsTable', () => {
    let component;
    beforeEach(() => {
        component = shallowMount(DiveAnalyticsTable);
    });

    test('it should have table headers', () => {
        const ths = component.findAll('.dat__label');
        expect(ths.wrappers.map(th => th.text())).toEqual([
            'Parameter',
            'Min',
            'Max',
            'Avg'
        ]);
    });

    test('it should not yet have rows', () => {
        expect(component.findAll('.dat__val').length).toEqual(0);
    });

    describe('when it receives `analytics`', () => {
        beforeEach(() => {
            component.setProps({
                analytics: [
                    {
                        prop: 'foo',
                        min: 1,
                        max: 2,
                        avg: 3
                    }
                ]
            });
        });

        test('it render it as a row of data', () => {
            const ths = component.findAll('.dat__val');
            expect(ths.wrappers.map(th => th.text())).toEqual([
                'foo',
                '1',
                '2',
                '3'
            ]);
        });
    });
});
