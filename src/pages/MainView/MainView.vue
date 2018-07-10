<template>
  <main class="map__main">
    <div class="map__container columns is-gapless">
      <SimpleMap
        :markers="mapMarkers"
        view="global"
        style="height: 100%;"
        class="column"
        @markerClick="onMarkerClick"
      />
      <section class="map__details" v-if="selectedDive">
        <DiveInfoTable
          :dive="selectedDive"
          class="column is-narrow"
        />

        <div class="buttons is-right">
          <router-link :to="diveRoute" class="button is-text">
              <BarChartIcon />
              See Data
          </router-link>
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
            selectedDive: undefined,
            diveRoute: {}
        };
    },
    computed: {
        dives() {
            const dives = this.$store.getters['dives/localList'](this.key);
            return dives;
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
        },
        onMarkerClick(diveId) {
            this.selectedDive = this.$store.getters['dives/getDiveById'](
                diveId
            );
            this.diveRoute = {
                name: 'diveDetails',
                params: {
                    id: diveId
                }
            };
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
</style>
