<template>
  <div class="dives">
    <nav class="navbar is-dark">
      <div class="navbar-brand">
        <div class="navbar-item">
          <h1 class="title has-text-white">Hermes</h1>
        </div>
        <a
          :class="{'is-active': showCardList}"
          role="button"
          class="navbar-burger has-text-white is-hidden-tablet"
          aria-label="menu"
          aria-expanded="false"
          @click="toggleDiveList()">
          <span aria-hidden="true"/>
          <span aria-hidden="true"/>
          <span aria-hidden="true"/>
        </a>
      </div>
    </nav>
    <main class="dives-main">
      <div class="dives-view-container columns is-variable is-1">
        <aside
          :class="{'is-hidden-mobile': !showCardList, 'is-active': showCardList}"
          class="dive-list column is-narrow"
        >
          <DiveList
            :on-click="onDiveSelect"
          />
        </aside>
        <section
          v-if="selectedDive"
          class="dive-details column">
          <div class="container">
            <div class="tile is-ancestor">
              <div class="tile is-vertical">
                <div class="tile">
                  <div class="tile is-6 is-vertical">
                    <div class="tile is-parent">
                      <div class="tile is-child card">
                        <DiveInfoTable
                          :dive="selectedDive"
                          :prop-list="divePropList"/>
                      </div>
                    </div>
                    <div class="tile is-parent">
                      <div class="tile is-child card" >
                        <DiveAnalyticsTable :analytics="diveAnalytics" />
                      </div>
                    </div>
                  </div>
                  <div class="tile is-6 is-parent">
                    <div class="tile is-child">
                      <SimpleMap
                        :markers="mapMarkers"
                        style="height: 500px;"
                      />
                    </div>
                  </div>
                </div>
                <div class="tile is-parent">
                  <div class="tile is-child card">
                    <LineChart :chart-data="chartData" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section
          v-if="!selectedDive"
          class="column empty">
          <h1 class="title">Select a dive</h1>
        </section>
      </div>
    </main>
  </div>
</template>

<script>
import {
    DiveList,
    DiveInfoTable,
    DiveAnalyticsTable,
    LineChart,
    SimpleMap
} from '~/components';
import isNumber from 'lodash/isNumber';
import {fetchDive} from '~/api';

export default {
    components: {
        DiveList,
        DiveInfoTable,
        DiveAnalyticsTable,
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
            this.showCardList = false;
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

<style lang="scss" scoped>
.dives,
.dives-view-container,
.dive-list,
.dive-details {
    height: 100%;
}

.navbar {
    height: 60px;
}

.dives-main {
    height: calc(100% - 60px);
}

.dives-view-container {
    overflow: hidden;
    margin-top: 0;

    .dive-list {
        padding-top: 0;
        width: 250px;
        max-width: 250px;
        width: 14vw;
        min-width: 150px;

        &.is-active {
            max-width: 100%;
            width: 100%;
        }
    }

    .dive-details {
        padding-top: 4px;
    }

    .dive-details {
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
    }

    .empty {
        display: flex;
        justify-content: center;
    }

    .empty h1 {
        padding: 5rem;
    }
}

.column {
    padding-bottom: 0;
}
</style>
