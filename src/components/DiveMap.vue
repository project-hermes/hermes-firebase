<template>
    <div style="height: 800px;" id="dive-map" />
</template>

<script>
    import L from 'leaflet';
    export default {
        props: {
            mapInfo: {
                type: Object,
                default: {}
            }
        },
        watch: {
            mapInfo () {
                const {coordinateStart, coordinateEnd, timeStart, timeEnd} = this.mapInfo;
                const start = L.latLng(coordinateStart.latitude, coordinateStart.longitude);
                const end = L.latLng(coordinateEnd.latitude, coordinateEnd.longitude);
                if (this.startMarker) {
                    this.map.removeLayer(this.startMarker);
                }

                if (this.endMarker) {
                    this.map.removeLayer(this.endMarker);
                }

                this.map.setView(start, 18);
                this.startMarker = L.marker(start, {})
                    .addTo(this.map)
                    .bindPopup(`Start of dive: ${timeStart}`);
                this.endMarker = L.marker(end)
                    .addTo(this.map)
                    .bindPopup(`End of dive: ${timeEnd}`);
            }
        },
        data () {
            return {
                map: null,
                startMarker: null,
                endMarker: null
            };
        },
        mounted () {
            this.initMap();
        },
        methods: {
            initMap () {
                this.map = L.map('dive-map'); // .setView([25.188872, -80.347362], 13);
                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 18,
              }).addTo(this.map);
                this.map.scrollWheelZoom.disable();
            }
        }
    }

</script>
