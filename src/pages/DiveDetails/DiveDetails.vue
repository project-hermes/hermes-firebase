<template>
  <main class="dives__main">

    <div class="container">
      <div class="tile is-ancestor">
        <div class="tile is-vertical">
          <div class="tile">
            <div class="tile is-6 is-vertical">
              <div class="tile is-parent">
                <div
                  v-loading="diveLoading"
                  class="tile is-child card">
                  <DiveInfoTable
                    :dive="dive"/>
                </div>
              </div>
              <div class="tile is-parent">
                <div
                  v-loading="dataLoading"
                  class="tile is-child card" >
                  <DiveAnalyticsTable
                    :analytics="diveAnalytics" />
                </div>
              </div>
            </div>
            <div class="tile is-6 is-parent">
              <div
                v-loading="diveLoading"
                class="tile is-child">
                <SimpleMap
                  :markers="mapMarkers"
                  style="height: 500px;"
                />
              </div>
            </div>
          </div>
          <div class="tile is-parent">
            <div
              v-loading="dataLoading"
              class="tile is-child card">
              <LineChart
                :chart-data="chartData" />
            </div>
          </div>
        </div>
      </div>
    </div>
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
            diveLoading: false,
            dataLoading: false
        };
    },
    computed: {
        dive() {
            return this.$store.getters['dives/getDiveById'](this.id);
        },
        diveData() {
            const diveData = this.$store.getters['dives/getDiveDataById'](
                this.id
            );
            if (diveData) {
                return this.processDiveData(diveData);
            }
        },
        chartData() {
            if (this.diveData) {
                const {depth, temp1, temp2} = this.diveData;
                return this.buildChartData({
                    depthSeries: depth.series,
                    temp1Series: temp1.series,
                    temp2Series: temp2.series
                });
            }
            return {};
        },
        diveAnalytics() {
            if (this.diveData) {
                const {depth, temp1, temp2} = this.diveData;
                return [
                    this.cmFormat(depth),
                    this.celciusFormat(temp1),
                    this.celciusFormat(temp2)
                ];
            }
            return [];
        },
        mapMarkers() {
            return this.dive ? this.createMapMarkers(this.dive) : [];
        }
    },
    mounted() {
        const id = this.id;
        this.diveLoading = !this.dive;
        this.dataLoading = !this.diveData;

        this.fetchDive(id).then(() => {
            this.diveLoading = false;
        });
        this.fetchDiveData(id).then(() => {
            this.dataLoading = false;
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
.dives__main {
    height: calc(100% - 60px);
    padding: 1rem 0;
}
</style>
