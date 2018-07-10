<template>
  <main class="dives__main">
    <section
      v-if="dive"
      class="dives__details">
      <div class="container">
        <div class="tile is-ancestor">
          <div class="tile is-vertical">
            <div class="tile">
              <div class="tile is-6 is-vertical">
                <div class="tile is-parent">
                  <div class="tile is-child card">
                    <DiveInfoTable
                      :dive="dive"/>
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
  </main>
</template>

<script>
import {
    DiveInfoTable,
    DiveAnalyticsTable,
    LineChart,
    SimpleMap
} from '~/components';
import isNumber from 'lodash/isNumber';
import {mapActions} from 'vuex';

export default {
    components: {
        DiveInfoTable,
        DiveAnalyticsTable,
        LineChart,
        SimpleMap
    },
    props: {
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            dive: null,
            chartData: {},
            diveAnalytics: [],
            mapMarkers: undefined
        };
    },
    mounted() {
        const id = this.id;
        Promise.all([this.fetchDive(id), this.fetchDiveData(id)]).then(() => {
            const dive = this.$store.getters['dives/getDiveById'](id);
            this.dive = dive;
            const rows = this.$store.getters['dives/getDiveDataById'](id);
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

            this.mapMarkers = this.createMapMarkers(dive);
        });
    },
    methods: {
        ...mapActions({
            fetchDiveData: 'dives/fetchDiveData',
            fetchDive: 'dives/fetchDive'
        }),
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

            rows.forEach(data => {
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
.dives__view,
.dives__list,
.dives__details {
    height: 100%;
}

.navbar {
    height: 60px;
}

.dives__main {
    height: calc(100% - 60px);
}

.dives__view {
    overflow: hidden;
    margin-top: 0;

    .dives__list {
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

    .dives__details {
        padding-top: 4px;
    }

    .dives__details {
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
