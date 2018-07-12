<template>
  <main class="map__main">
    <div class="map__container columns is-gapless">
      <SimpleMap
        v-model="selectedDiveId"
        :markers="mapMarkers"
        view="global"
        style="height: 100%;"
        class="column map__map"
      />
      <section
        v-if="selectedDive"
        class="map__details">
        <div class="column is-narrow">
          <DiveInfoTable
            :dive="selectedDive"
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
      </section>
    </div>
  </main>
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
.map__main {
    height: calc(100% - 60px);
}

.map__container {
    height: 100%;
}

.map__details {
    padding: 1rem;
}

.map__details-button {
    width: 100%;
}
</style>
