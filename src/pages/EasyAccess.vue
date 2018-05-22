<template>
  <div>
      <DiveChooser
        :dives="dives"
        :onChange="onDiveSelect"
      />
      <Chart :chart-data="chartData" />
  </div>
</template>

<script>
import DiveChooser from '../components/DiveChooser.vue';
import Chart from '../components/Chart.vue';
import sortBy from 'lodash/sortBy';
import {db} from '../firebase';

export default {
    components: {
        DiveChooser,
        Chart
    },
    data () {
        return {
            dives: [],
            chartData: []
        };
    },
    mounted () {
        this.fetchDives().then(dives => {
            this.dives = sortBy(dives, ({time}) => -time);
        });
    },
    methods: {
        fetchDives () {
            return db.collection('Dive').get().then(querySnapshot => {
                const dives = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    const date = data.timeEnd.toDate();
                    dives.push({
                        data,
                        value: doc.id,
                        id: doc.id,
                        time: date.valueOf(),
                        label: date.toLocaleString()
                    });
                });
                return dives;
            });
        },
        onDiveSelect (id) {
            db.doc(`Dive/${id}`).collection('data').get().then(snapshot => {
                const rows = sortBy(snapshot.docs, ['id']).map(row => {
                    const data = row.data();
                    return {
                        x: data.timestamp,
                        y: data.temp1
                    };
                });

                this.chartData = {
                    labels: rows.map(row => (new Date(row.x * 1000)).toTimeString()),
                    datasets: [
                        {
                            label: 'Temperature',
                            data: rows
                        }
                    ]
                };
            });
        }
    }
}

</script>
