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
        <DiveList
          :on-click="onDiveSelect"
        />
      </el-aside>
      <el-main v-if="selectedDive">
        <el-row
          :gutter="20"
          class="dive-info-row">
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
                v-for="item in divePropList"
                :key="item.prop"
                class="text item">
                <span class="dive-details-prop">{{ item.prop }}</span>&colon;&nbsp;
                <span class="dive-details-value">{{ item.value }}</span>
              </div>
            </el-card>
            <DiveInfoTable :analytics="diveAnalytics" />
          </el-col>
          <el-col
            :xs="24"
            :sm="24"
            :md="12"
            :lg="12"
            :xl="12"
            class="map-container">
            <el-card><SimpleMap
              :markers="mapMarkers"
              style="height: 500px;"
            /></el-card>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-card>
              <LineChart :chart-data="chartData" />
            </el-card>
          </el-col>
        </el-row>
      </el-main>
      <el-main
        v-if="!selectedDive"
        class="empty">
        <h1>Select a dive</h1>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import {DiveList, DiveInfoTable, LineChart, SimpleMap} from '~/components';
import isNumber from 'lodash/isNumber';
import {fetchDive} from '~/api';

export default {
    components: {
        DiveList,
        DiveInfoTable,
        LineChart,
        SimpleMap
    },
    data() {
        return {
            selectedDive: null,
            chartData: {},
            diveAnalytics: [],
            divePropList: [],
            mapMarkers: undefined,
            showCardList: false
        };
    },
    methods: {
        toggleDiveList() {
            this.showCardList = !this.showCardList;
        },
        onDiveSelect(dive) {
            fetchDive(dive.id).then(snapshot => {
                const rows = snapshot.docs;
                const {depth, temp1, temp2} = this.processDiveData(rows);
                this.chartData = this.buildChartData({
                    depthSeries: depth.series,
                    temp1Series: temp1.series,
                    temp2Series: temp2.series
                });

                this.diveAnalytics = [
                    this.cmFormat(depth),
                    this.celciusFormat(temp1),
                    this.celciusFormat(temp2)
                ];
            });

            this.showCardList = false;
            this.selectedDive = dive;
            this.divePropList = this.buildPropList(dive.data);
            this.mapMarkers = this.createMapMarkers(dive.data);
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
            return [
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
        },
        buildPropList(diveData) {
            return Object.entries(diveData).map(([prop, value]) => {
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
            });
        },
        processDiveData(rows) {
            const props = ['depth', 'temp1', 'temp2'];
            const propMap = props.reduce((map, prop) => {
                map[prop] = {
                    prop,
                    min: Number.MAX_SAFE_INTEGER,
                    max: Number.MIN_SAFE_INTEGER,
                    sum: 0,
                    series: []
                };
                return map;
            }, {});

            rows.forEach(row => {
                const data = row.data();
                const {timestamp} = data;
                const date = new Date(timestamp * 1000);

                props.forEach(prop => {
                    const info = propMap[prop];
                    const value = data[prop];
                    info.series.push({x: date, y: value});
                    info.sum += value;
                    info.min = Math.min(info.min, value);
                    info.max = Math.max(info.max, value);
                });
            });

            props.forEach(prop => {
                const info = propMap[prop];
                info.avg = info.sum / rows.length;
            });

            return propMap;
        },
        celciusFormat(obj) {
            return Object.keys(obj).reduce((acc, key) => {
                const val = obj[key];
                acc[key] = isNumber(val) ? `${val.toLocaleString()} °C` : val;
                return acc;
            }, {});
        },
        cmFormat(obj) {
            return Object.keys(obj).reduce((acc, key) => {
                const val = obj[key];
                acc[key] = isNumber(val) ? `${val.toLocaleString()} cm` : val;
                return acc;
            }, {});
        },
        buildChartData({depthSeries, temp1Series, temp2Series}) {
            return {
                series: [
                    {
                        type: 'spline',
                        name: 'temp1',
                        data: temp1Series,
                        yAxis: 0,
                        tooltip: {
                            valueSuffix: ' °C'
                        }
                    },
                    {
                        type: 'spline',
                        name: 'temp2',
                        data: temp2Series,
                        yAxis: 0,
                        tooltip: {
                            valueSuffix: ' °C'
                        }
                    },
                    {
                        type: 'spline',
                        name: 'depth',
                        data: depthSeries,
                        yAxis: 1,
                        tooltip: {
                            valueSuffix: ' cm'
                        }
                    }
                ]
            };
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

.el-card {
    margin: 1em 0;
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

.el-container .dive-info-row {
    display: flex;
    align-items: center;
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

    .el-container .dive-info-row {
        display: block;
    }
}

.el-main {
    background-color: #fff;
    color: #333;
}

.card-container .el-card {
    margin: 4px;
    border: 1px solid #888;
    background-color: #e3f2fd;
    border-radius: 1px;
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

.empty {
    display: flex;
    justify-content: center;
}

.empty h1 {
    font-size: 2em;
    padding: 5em;
}
</style>
