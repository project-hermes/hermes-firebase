<template>
  <div>
      <DiveChooser
        :dives="dives"
        :onChange="onDiveSelect"
      />
      <DiveInfoTable :info="diveInfo" />
      <Chart :chart-data="chartData" />
  </div>
</template>

<script>
import DiveChooser from '../components/DiveChooser.vue';
import DiveInfoTable from '../components/DiveInfoTable.vue';
import Chart from '../components/Chart.vue';
import sortBy from 'lodash/sortBy';
import {db} from '../firebase';

export default {
    components: {
        DiveChooser,
        DiveInfoTable,
        Chart
    },
    data () {
        return {
            dives: [],
            chartData: [],
            diveInfo: []
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
            this.fetchDive(id).then(snapshot => {
                const rows = snapshot.docs;
                const depthInfo = {
                    prop: 'depth',
                    min: Number.MAX_SAFE_INTEGER,
                    max: Number.MIN_SAFE_INTEGER,
                    sum: 0
                };
                const depthSeries = [];

                const temp1Info = {
                    prop: 'temp1',
                    min: Number.MAX_SAFE_INTEGER,
                    max: Number.MIN_SAFE_INTEGER,
                    sum: 0
                };
                const temp1Series = [];

                const temp2Info = {
                    prop: 'temp2',
                    min: Number.MAX_SAFE_INTEGER,
                    max: Number.MIN_SAFE_INTEGER,
                    sum: 0
                };
                const temp2Series = [];

                const chartTimeStampLabels = [];

                rows.forEach(row => {
                    const {depth, temp1, temp2, timestamp} = row.data();
                    depthSeries.push({x: timestamp, y: depth});
                    depthInfo.sum += depth;
                    if (depthInfo.min > depth) depthInfo.min = depth;
                    if (depthInfo.max < depth) depthInfo.max = depth;

                    temp1Series.push({x: timestamp, y: temp1});
                    temp1Info.sum += temp1;
                    if (temp1Info.min > temp1) temp1Info.min = temp1;
                    if (temp1Info.max < temp1) temp1Info.max = temp1;

                    temp2Series.push({x: timestamp, y: temp2});
                    temp2Info.sum += temp2;
                    if (temp2Info.min > temp2) temp2Info.min = temp2;
                    if (temp2Info.max < temp2) temp2Info.max = temp2;

                    chartTimeStampLabels.push((new Date(timestamp * 1000)).toTimeString());
                });

                depthInfo.avg = depthInfo.sum / rows.length;
                temp1Info.avg = temp1Info.sum / rows.length;
                temp2Info.avg = temp2Info.sum / rows.length;

                this.chartData = {
                    labels: chartTimeStampLabels,
                    datasets: [
                        // {label: 'Depth', data: depthSeries, backgroundColor: 'red'},
                        {label: 'Temp 1', data: temp1Series, backgroundColor: 'green'},
                        // {label: 'Temp 2', data: temp2Series, backgroundColor: 'blue'}
                    ]
                }

                this.diveInfo = [
                    depthInfo,
                    temp1Info,
                    temp2Info
                ];
            });
        },
        fetchDive (id) {
            return db.doc(`Dive/${id}`).collection('data').orderBy('timestamp').get();
        },
        getNums (rows) {

        }
    }
}

</script>
