<template>
    <main class="main-view">
        <div class="main-view__map-wrapper">
          <div
            :class="{'main-view__details__open': selectedDiveId}"
            class="main-view__map-wrapper">
            <SimpleMap
              v-model="selectedDiveId"
              :markers="mapMarkers"
              view="global"
              class="main-view__map"
            />
          </div>
          <DiveInfoTable
            v-if="selectedDive"
            :dive="selectedDive"
            class="main-view__details"
          >
            <router-link
              slot="footer"
              :to="diveRoute"
              class="main-view__details-button button is-text">
              <BarChartIcon />
              See Data
            </router-link>
          </DiveInfoTable>
        </div>
    </main>
</template>
<script>
import {NavBar, SimpleMap, DiveInfoTable} from '~/components';
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
.main-view {
    height: 100%;
    padding-top: 0 !important;

    &__nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        opacity: 0.9;
    }

    &__map-wrapper {
        height: 100%;
    }

    &__map {
        height: 100%;

        /deep/ .leaflet-top {
            top: 55px;
        }
    }
}

.main-view__details {
    position: absolute;
    z-index: 499;
    right: 1rem;
    top: calc(52px + 1rem);
}

.main-view__details-button {
    width: 100%;
}

@media all and (max-width: 768px) {
    .main-view__details__open {
        height: calc(100% - 38px - 48px); // height of card header + footer
    }

    .main-view__details {
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
