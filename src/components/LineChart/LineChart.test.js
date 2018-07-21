import LineChart from './LineChart.vue';
import Highcharts from 'highcharts';
import {shallowMount} from '@vue/test-utils';

describe('LineChart', () => {
    let component;
    beforeEach(() => {
        component = shallowMount(LineChart, {});
    });

    test('it should render chart upon instantiation', () => {
        expect(Highcharts.chart).toHaveBeenCalled();
    });

    describe('when `chartData` is set', () => {
        beforeEach(() => {
            component.setProps({
                chartData: {
                    series: [123]
                }
            });
        });

        test('it should rerender the chart with the new series', () => {
            expect(Highcharts.chart).toHaveBeenCalledWith(
                'line-chart',
                expect.objectContaining({
                    series: [123]
                })
            );
        });
    });
});
