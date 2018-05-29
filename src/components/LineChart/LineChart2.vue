<template>
  <div id="line-chart" />
</template>

<script>
import Highcharts from 'highcharts';
export default {
    props: {
        chartData: {
            type: Object,
            default: undefined
        }
    },
    watch: {
        chartData() {
            Highcharts.chart('line-chart', {
                chart: {
                    type: 'spline'
                },
                title: '',
                plotOptions: {
                    series: {
                        turboThreshold: 3000
                    }
                },
                series: [
                    {
                        type: 'spline',
                        name: this.chartData.label,
                        data: this.chartData.series
                    }
                ]
            });
        }
    }
};
</script>
