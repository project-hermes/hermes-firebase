<template>
    <div id="simple-map" />
</template>

<script>
    import L from 'leaflet';
    import shortid from 'shortid';
    import head from 'lodash/head';
    export default {
        props: {
            markers: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                map: null,
                currentMarkers: []
            };
        },
        watch: {
            markers () {
                this.removeMarkers(this.map, this.currentMarkers);
                const {lat, lng} = head(this.markers);
                this.map.setView([lat, lng], 18);
                this.currentMarkers = this.addMarkers(this.map, this.markers);
            }
        },
        methods: {
            initMap () {
                this.map = L.map('simple-map');
                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 18,
                }).addTo(this.map);
                this.map.scrollWheelZoom.disable();
            },
            removeMarkers (map, markers) {
                markers.forEach(marker => {
                    map.removeLayer(marker);
                });
            },
            addMarkers (map, markerConfigs) {
                return markerConfigs.map(config => {
                    const {lat, lng, popupTemplate} = config;
                    return L.marker([lat, lng])
                        .addTo(map)
                        .bindPopup(popupTemplate);
                });
            }
        },
        mounted () {
            this.initMap();
        }
    }
</script>
