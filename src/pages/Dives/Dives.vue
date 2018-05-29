<template>
  <el-container>
    <el-header>
      <div
        :class="{open: showCardList}"
        class="card-list-button el-icon-arrow-down"
        @click="toggleDiveList"/>
      <h1 class="header-title">Hermes</h1>
    </el-header>
    <el-container>
      <el-aside
        :class="{open: showCardList}"
        width="250px"
      >
        <CardList
          :items="dives"
          :on-click="onDiveSelect"
        />
      </el-aside>
      <el-main v-if="isDiveSelected">
        <el-row :gutter="20">
          <el-col
            :xs="24"
            :sm="24"
            :md="12"
            :lg="12"
            :xl="12">
            <el-card class="dive-details-card">
              <div slot="header">
                <span class="dive-details-prop">Dive</span>&colon;&nbsp;
                <span class="dive-details-value">{{ selectedDive.id }}</span>
              </div>
              <div
                v-for="item in selectedDive.propList"
                :key="item.prop"
                class="text item">
                <span class="dive-details-prop">{{ item.prop }}</span>&colon;&nbsp;
                <span class="dive-details-value">{{ item.value }}</span>
              </div>
            </el-card>
          </el-col>
          <el-col
            :xs="24"
            :sm="24"
            :md="12"
            :lg="12"
            :xl="12"
            class="map-container">
            <SimpleMap
              :markers="mapMarkers"
              style="height: 400px;"
            />
          </el-col>
        </el-row>
        <DiveInfoTable :analytics="diveAnalytics" />
        <el-row>
          <el-col :span="24">
            <LineChart :chart-data="chartData" />
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import {CardList, DiveInfoTable, LineChart, SimpleMap} from '../../components';
import sortBy from 'lodash/sortBy';
import {db} from '../../firebase';

export default {
    components: {
        CardList,
        DiveInfoTable,
        LineChart,
        SimpleMap
    },
    data() {
        return {
            dives: [],
            isDiveSelected: false,
            diveItem: {},
            chartData: {},
            diveAnalytics: [],
            series: {},
            selectedDive: null,
            mapMarkers: undefined,
            showCardList: false
        };
    },
    mounted() {
        this.fetchDives().then(dives => {
            this.dives = sortBy(dives, ({time}) => -time);
            this.onDiveSelect(this.dives[0].id);
        });
    },
    methods: {
        fetchDives() {
            return db
                .collection('Dive')
                .get()
                .then(querySnapshot => {
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
        toggleDiveList() {
            this.showCardList = !this.showCardList;
        },
        onDiveSelect(id) {
            this.isDiveSelected = true;
            this.showCardList = false;
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

                    chartTimeStampLabels.push(
                        new Date(timestamp * 1000).toTimeString()
                    );
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
                    datasets: [this.series.temp1]
                };

                this.diveAnalytics = [
                    this.cmFormat(depthInfo),
                    this.celciusFormat(temp1Info),
                    this.celciusFormat(temp2Info)
                ];
            });

            const dive = this.dives.find(dive => dive.id === id);
            this.selectedDive = dive;
            this.selectedDive.propList = Object.entries(dive.data).map(
                ([prop, value]) => {
                    switch (prop) {
                        case 'coordinateEnd':
                        case 'coordinateStart':
                            return {
                                prop,
                                value: `[${value.latitude}, ${value.longitude}]`
                            };
                        case 'createdAt':
                        case 'lastUpdatedAt':
                            return {
                                prop,
                                value: new Date(value).toLocaleString()
                            };
                        case 'timeEnd':
                        case 'timeStart':
                            return {
                                prop,
                                value: value.toDate().toLocaleString()
                            };
                        default:
                            return {
                                prop,
                                value
                            };
                    }
                }
            );
            this.$nextTick(() => {
                this.createMapMarkers(dive.data);
            });
        },
        fetchDive(id) {
            return db
                .doc(`Dive/${id}`)
                .collection('data')
                .orderBy('timestamp')
                .get();
        },
        celciusFormat(obj) {
            return Object.keys(obj).reduce((acc, key) => {
                acc[key] = `${obj[key]} °C`;
                return acc;
            }, {});
        },
        cmFormat(obj) {
            return Object.keys(obj).reduce((acc, key) => {
                acc[key] = `${obj[key]} cm`;
                return acc;
            }, {});
        },
        createMapMarkers(diveData) {
            const {
                coordinateEnd: {latitude: endLat, longitude: endLng},
                coordinateStart: {latitude: startLat, longitude: startLng},
                timeStart,
                timeEnd
            } = diveData;
            const startDate = timeStart.toDate().toLocaleString();
            const endDate = timeEnd.toDate().toLocaleString();
            this.mapMarkers = [
                {
                    lat: startLat,
                    lng: startLng,
                    popupTemplate: `Dive started ${startDate}`
                },
                {
                    lat: endLat,
                    lng: endLng,
                    popupTemplate: `Dive ended ${endDate}`
                }
            ];
        }
    }
};
</script>

<style>
.el-container {
    height: 100%;
}

.el-header {
    background-color: #486591;
    color: #fff;
    display: flex;
    justify-content: start;
}

.el-header .header-title {
    margin: 0 0 0 0.5em;
    padding: 0;
    line-height: 60px;
}

.el-container .el-aside {
    background-color: #e3f2fd;
    color: #333;
    text-align: center;
    overflow-y: hidden;
}

.el-container .card-list-button {
    display: none;
    transition: transform 100ms;
}

.card-list-button::before {
    font-size: 2em;
    line-height: 60px;
    cursor: pointer;
}

.card-list-button.open {
    transform: rotate(-90deg);
}

@media (max-width: 767px) {
    .el-container .el-aside {
        display: none;
    }

    .el-container .el-aside.open {
        display: block;
        width: 100% !important;
    }

    .el-container .card-list-button {
        display: block;
    }
}

.el-main {
    background-color: #fff;
    color: #333;
}

.card-container .el-card {
    margin: 4px;
    border: 1px solid #dadada;
    background-color: #e3f2fd;
    border-radius: 1px;
}

.card-container .el-card.is-always-shadow {
    box-shadow: 0px 1px 5px 0 rgba(0, 0, 0, 0.3);
}

.card-container .el-card.is-always-shadow:hover {
    box-shadow: 0px 3px 5px 0 rgba(0, 0, 0, 0.3);
}

.card-container .el-card:hover {
    background-color: #f3faff;
}

.dive-details-card {
    font-size: 1.15em;
    line-height: 1.5em;
}

.dive-details-prop {
    font-weight: bold;
}
</style>