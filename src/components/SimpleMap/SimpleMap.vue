<template>
  <div id="simple-map" />
</template>

<script>
import L from 'leaflet';
import head from 'lodash/head';
import {GeoSearchControl, OpenStreetMapProvider} from 'leaflet-geosearch';

export default {
    props: {
        markers: {
            type: Array,
            default: () => []
        },
        view: {
            type: String,
            default: 'local'
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
        this.map.setView([0, 0], 2);
        if (this.markers.length) {
            this.replaceMarkers(this.markers);
        }
    },
    methods: {
        initMap() {
            this.map = L.map('simple-map');
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(this.map);
            this.map.scrollWheelZoom.disable();

            // var bounds = [[54.559322, -5.767822], [56.1210604, -3.021240]];
            // // create an orange rectangle
            // L.rectangle(bounds, {color: "#ff7800", weight: 1}).addTo(this.map);
            // // zoom the map to the rectangle bounds
            // this.map.fitBounds(bounds);

            // const provider = new OpenStreetMapProvider();
            //
            // const searchControl = new GeoSearchControl({
            //   provider,
            //   style: 'bar',
            //   showMarker: false
            // });
            //
            // this.map.addControl(searchControl);
        },
        removeMarkers(map, markers) {
            markers.forEach(marker => {
                map.removeLayer(marker);
            });
        },
        addMarkers(map, markerConfigs) {
            return markerConfigs.map(config => {
                const {lat, lng, popupTemplate, id} = config;
                let marker = L.marker([lat, lng])
                    .addTo(map)
                    .on('click', () => {
                        this.$emit('markerClick', id);
                        this.$nextTick(() => {
                            this.map.invalidateSize();
                            this.map.setView(
                                [lat, lng],
                                this.view === 'global' ? 3 : 12
                            );
                        });
                    });
                marker = popupTemplate
                    ? marker.bindPopup(popupTemplate)
                    : marker;
                return marker;
            });
        },
        replaceMarkers(newMarkers) {
            this.removeMarkers(this.map, this.currentMarkers);
            if (this.view === 'local') {
                const {lat, lng} = head(newMarkers);
                this.map.setView([lat, lng], 12);
            } else if (this.view === 'global') {
                this.map.setView([0, 0], 2);
            }

            this.currentMarkers = this.addMarkers(this.map, newMarkers);
        }
    }
};
</script>
