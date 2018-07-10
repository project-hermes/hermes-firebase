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
            this.renderChart();
        }
    },
    mounted() {
        this.renderChart();
    },
    methods: {
        renderChart() {
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
                tooltip: {
                    shared: true
                },
                xAxis: {
                    type: 'datetime'
                },
                yAxis: [
                    {
                        title: {
                            text: 'Temperature'
                        },
                        labels: {
                            format: '{value} °C'
                        }
                    },
                    {
                        title: {
                            text: 'Depth'
                        },
                        labels: {
                            format: '{value} cm'
                        },
                        opposite: true
                    }
                ],
                series: this.chartData.series
            });
        }
    }
};
</script>
