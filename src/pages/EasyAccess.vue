<template>
    <el-container>
        <el-header>
            <h1>Hermes Dive View</h1>
        </el-header>
        <el-container>
            <el-aside width="200px">
                <CardList
                  :items="dives"
                  :onClick="onDiveSelect"
                />
            </el-aside>
            <el-main v-if="isDiveSelected">
                <h3 v-if="selectedDive">Dive {{selectedDive.label}}</h3>
                <DiveInfoTable :analytics="diveAnalytics" />
                <Chart :chart-data="chartData" />
                <DiveMap :map-info="mapInfo" />
            </el-main>
            <el-main v-else class="empty">
                <h2>Select a dive</h2>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
import CardList from '../components/CardList/CardList.vue';
import DiveInfoTable from '../components/DiveInfoTable.vue';
import DiveMap from '../components/DiveMap.vue';
import Chart from '../components/Chart.vue';
import sortBy from 'lodash/sortBy';
import {db} from '../firebase';

export default {
    components: {
        CardList,
        DiveInfoTable,
        Chart,
        DiveMap
    },
    data () {
        return {
            dives: [],
            isDiveSelected: false,
            diveItem: {},
            chartData: [],
            diveAnalytics: [],
            mapInfo: {},
            series: {},
            selectedDive: null
        };
    },
    mounted () {
        this.fetchDives().then(dives => {
            this.dives = sortBy(dives, ({time}) => -time);
            this.onDiveSelect(this.dives[0].id);
        });
    },
    methods: {
        fetchDives () {
            return db.collection('Dive').get().then(querySnapshot => {
                const dives = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    data.id = doc.id;
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
            this.isDiveSelected = true;
            this.fetchDive(id).then(snapshot => {
                // if (selectedDive.id !== id) return;
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

                this.series = {
                    depth: {label: 'Depth', data: depthSeries},
                    temp1: {label: 'Temp 1', data: temp1Series},
                    temp2: {label: 'Temp 2', data: temp2Series}
                };

                this.chartData = {
                    labels: chartTimeStampLabels,
                    datasets: [
                        this.series.temp1
                    ]
                }

                this.diveAnalytics = [
                    this.cmFormat(depthInfo),
                    this.celciusFormat(temp1Info),
                    this.celciusFormat(temp2Info)
                ];
            });

            const dive = this.dives.find(dive => dive.id === id);
            this.selectedDive = dive;
            const {coordinateEnd, coordinateStart, timeEnd, timeStart} = dive.data;
            this.$nextTick(() => {
                this.mapInfo = {
                    coordinateEnd: {
                        latitude: coordinateEnd.latitude,
                        longitude: coordinateEnd.longitude
                    },
                    coordinateStart: {
                        latitude: coordinateStart.latitude,
                        longitude: coordinateStart.longitude
                    },
                    timeEnd: timeEnd.toDate().toLocaleString(),
                    timeStart: timeStart.toDate().toLocaleString()
                };
            });
        },
        fetchDive (id) {
            return db.doc(`Dive/${id}`).collection('data').orderBy('timestamp').get();
        },
        celciusFormat (obj) {
            return Object.keys(obj).reduce((acc, key) => {
                acc[key] = `${obj[key]} °C`
                return acc;
            }, {});
        },
        cmFormat (obj) {
            return Object.keys(obj).reduce((acc, key) => {
                acc[key] = `${obj[key]} cm`
                return acc;
            }, {});
        }
    }
}

</script>

<style>
    .el-container {
        height: 100%;
    }

    .empty {
        display: flex;
        justify-content: center;
    }

    .empty h1 {
        font-size: 3em;
        margin-top: 40px;
    }
  .el-header {
    background-color: #bdccdf;
    color: #333;
  }

  .el-aside {
    background-color: #D3DCE6;
    color: #333;
    text-align: center;
    overflow-y: scroll;
  }

  .el-main {
    background-color: #E9EEF3;
    color: #333;
  }

  .card-container .el-card {
      margin: 4px;
      border: 1px solid #b9b9b9;
      background-color: #dfe5ea;
      border-radius: 1px;
  }

  .card-container .el-card:hover {
      background-color: #f3faff;
  }
</style>
