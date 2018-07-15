<template>
  <div id="simple-map" />
</template>

<script>
import L from 'leaflet';
import head from 'lodash/head';
// import {GeoSearchControl, OpenStreetMapProvider} from 'leaflet-geosearch';

export default {
    props: {
        value: {
            type: String,
            default: undefined
        },
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
            currentMarkers: [],
            maxZoom: 13
        };
    },
    watch: {
        markers() {
            this.replaceMarkers(this.markers);
            this.focusSelectedMarker(this.value);
        },
        value: {
            immediate: true,
            handler(id) {
                this.focusSelectedMarker(id);
            }
        }
    },
    mounted() {
        this.initMap();
        this.map.setView([0, 0], 2);
        if (this.markers.length) {
            this.replaceMarkers(this.markers);
        }
    },
    beforeDestroy() {
        this.map.off();
        this.map.remove();
    },
    methods: {
        initMap() {
            this.map = L.map('simple-map');
            // L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            //     maxZoom: 18,
            //     attribution:
            //         '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            // }).addTo(this.map);

            // L.tileLayer(
            //     'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
            //     {
            //         attribution:
            //             'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
            //         maxZoom: 16
            //     }
            // ).addTo(this.map);
            this.maxZoom = 13;
            L.tileLayer(
                'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
                {
                    attribution:
                        'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
                    maxZoom: this.maxZoom
                }
            ).addTo(this.map);

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
                        this.$nextTick(() => {
                            this.map.invalidateSize();
                            this.map.setView([lat, lng], this.getZoom());

                            // emitting this immediately conficts with leaflet's
                            // zoom animation for some reason.
                            setTimeout(() => {
                                this.$emit('input', id);
                            }, 50);
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
                this.map.setView([lat, lng], this.getDefaultZoom());
            } else if (this.view === 'global') {
                this.map.setView([0, 0], this.getDefaultZoom());
            }

            this.currentMarkers = this.addMarkers(this.map, newMarkers);
        },
        focusSelectedMarker(id) {
            const marker = this.markers.find(marker => marker.id === id);
            if (marker) {
                const {lat, lng} = marker;
                this.$nextTick(() => {
                    this.map.invalidateSize();
                    this.map.setView([lat, lng], this.getZoom());
                });
            }
        },
        getZoom() {
            if (!this.map) return;
            const zoom = this.map.getZoom();
            const defaultZoom = this.getDefaultZoom();
            return zoom > defaultZoom ? zoom : defaultZoom;
        },
        getDefaultZoom() {
            // const localZoom = this.maxZoom - 4;
            return this.view === 'global' ? 3 : 5;
        }
    }
};
</script>
