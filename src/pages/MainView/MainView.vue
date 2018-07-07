<template>
  <div class="map">
    <main class="map__main">
      <div class="columns is-gapless">
        <SimpleMap
          :markers="mapMarkers"
          view="global"
          style="height: 800px;"
          @markerClick="onMarkerClick"
          class="column"
        />
        <DiveInfoTable
        v-if="selectedDive"
          :dive="selectedDive"
          class="column is-narrow"
          />
      </div>
    </main>
  </div>
</template>
<script>
import {SimpleMap, DiveInfoTable} from '~/components';
import {mapActions} from 'vuex';

export default {
    components: {
        SimpleMap,
        DiveInfoTable
    },
    data() {
        return {
            key: 'MainView',
            mapMarkers: undefined,
            selectedDive: undefined
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
        }
    }
};
</script>
<style lang="scss" scoped>
</style>
