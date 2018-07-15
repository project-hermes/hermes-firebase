<template>
  <div class="map__container">
    <SimpleMap
      v-model="selectedDiveId"
      :markers="mapMarkers"
      view="global"
      class="map__map"
    />
    <DiveInfoTable
      v-show="selectedDive"
      :dive="selectedDive"
      class="map__details"
    >
      <router-link
        slot="footer"
        :to="diveRoute"
        class="map__details-button button is-text">
        <BarChartIcon />
        See Data
      </router-link>
    </DiveInfoTable>
  </div>
</template>
<script>
import {SimpleMap, DiveInfoTable} from '~/components';
import {mapActions} from 'vuex';
import BarChartIcon from 'vue-feather-icons/icons/BarChartIcon';

export default {
    components: {
        SimpleMap,
        DiveInfoTable,
        BarChartIcon
    },
    data() {
        return {
            key: 'MainView',
            mapMarkers: undefined,
            selectedDiveId: undefined
        };
    },
    computed: {
        dives() {
            const dives = this.$store.getters['dives/localList'](this.key);
            return dives;
        },
        selectedDive() {
            return this.$store.getters['dives/getDiveById'](
                this.selectedDiveId
            );
        },
        diveRoute() {
            return {
                name: 'diveDetails',
                params: {
                    id: this.selectedDiveId
                }
            };
        }
    },
    watch: {
        selectedDiveId() {
            this.$router.push({
                name: 'main',
                query: {diveId: this.selectedDiveId}
            });
        },
        '$route.query.diveId': {
            immediate: true,
            handler(diveId) {
                this.selectedDiveId = diveId;
            }
        }
    },
    mounted() {
        this.fetchLocalDives({
            key: this.key,
            config: {
                limit: 50
            }
        }).then(dives => {
            this.mapMarkers = this.createMapMarkers(dives);
            if (this.$route.query.diveId) {
                // this.selectedDiveId = this.$route.query.diveId;
            }
        });
    },
    methods: {
        ...mapActions({
            fetchLocalDives: 'dives/fetchLocalDives'
        }),
        createMapMarkers(dives) {
            return dives.map(dive => {
                const {
                    coordinateStart: {latitude: lat, longitude: lng},
                    id
                } = dive;

                return {
                    lat,
                    lng,
                    id
                };
            });
        }
    }
};
</script>
<style lang="scss" scoped>
.map__container,
.map__map {
    height: 100%;
}

.map__details {
    position: absolute;
    z-index: 499;
    right: 1rem;
    top: calc(52px + 1rem);
}

.map__details-button {
    width: 100%;
}

@media all and (max-width: 768px) {
    .map__map {
        height: 65%;
    }

    .map__details {
        position: relative;
        top: 0;
        right: 0;
        left: 0;
        display: flex;
        flex-direction: column;

        /deep/ .card-header {
            order: 0;
        }

        /deep/ .card-content {
            order: 2;
        }

        /deep/ .card-footer {
            order: 1;
            border-bottom: 1px solid #dbdbdb;
        }
    }
}
</style>
