<script>
import { Line, mixins } from 'vue-chartjs';
export default {
    extends: Line,
    mixins: [mixins.reactiveProp],
    props: {
        chartData: Object,
        options: {
            default: () => ({
                responsive: true,
                maintainAspectRatio: false,
                style: {position: 'relative', height: '800px'},
                scales: {
                    yAxes: [{ticks: {beginAtZero: true}}]
                }
            })
        }
    },
    mounted () {
        this.renderChart(this.chartData, this.options);
    }
}
</script>
