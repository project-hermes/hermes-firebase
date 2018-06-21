<template>
  <div id="simple-map" />
</template>

<script>
import L from 'leaflet';
import head from 'lodash/head';
export default {
    props: {
        markers: {
            type: Array,
            default: () => []
        }
    },
    data() {
        return {
            map: null,
            currentMarkers: []
        };
    },
    watch: {
        markers() {
            this.replaceMarkers(this.markers);
        }
    },
    mounted() {
        this.initMap();
        if (this.markers.length) {
            this.replaceMarkers(this.markers);
        }
    },
    methods: {
        initMap() {
            this.map = L.map('simple-map');
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18
            }).addTo(this.map);
            this.map.scrollWheelZoom.disable();
        },
        removeMarkers(map, markers) {
            markers.forEach(marker => {
                map.removeLayer(marker);
            });
        },
        addMarkers(map, markerConfigs) {
            return markerConfigs.map(config => {
                const {lat, lng, popupTemplate} = config;
                return L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup(popupTemplate);
            });
        },
        replaceMarkers(newMarkers) {
            this.removeMarkers(this.map, this.currentMarkers);
            const {lat, lng} = head(newMarkers);
            this.map.setView([lat, lng], 12);
            this.currentMarkers = this.addMarkers(this.map, newMarkers);
        }
    }
};
</script>
