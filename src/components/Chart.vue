<script>
import { Line, mixins } from 'vue-chartjs';
export default {
    extends: Line,
    mixins: [mixins.reactiveProp],
    props: ['chartData'],
    mounted () {
        this.renderChart(this.chartData, this.options);
    },
    data() {
        return {
            options: {
                responsive: true,
                maintainAspectRatio: false,
                style: {position: 'relative', height: '800px'},
                scales: {
                    yAxes: [{ticks: {beginAtZero: true}}]
                }
            }
        };
    }
}
</script>
