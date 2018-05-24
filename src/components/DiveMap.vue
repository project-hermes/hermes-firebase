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
        data () {
            return {
            };
        },
        mounted () {
            this.initMap();
            this.initLayers();
        },
        methods: {
            initMap () {
                var mymap = L.map('dive-map').setView([25.188872, -80.347362], 13);
                L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                  maxZoom: 18,
                }).addTo(mymap);
                mymap.scrollWheelZoom.disable();
                var marker = L.marker([25.188872, -80.347362]).addTo(mymap);
            },
            initLayers () {}
        }
        // computed: {
        //     center () {
        //         if (!this.mapInfo.coordinateStart) return;
        //         const {coordinateStart} = this.mapInfo;
        //         return L.latLng(coordinateStart.latitude, coordinateStart.longitude);
        //     },
        //     markerStart () {
        //         if (!this.mapInfo.coordinateStart) return;
        //         const {coordinateStart} = this.mapInfo;
        //         return L.latLng(coordinateStart.latitude, coordinateStart.longitude);
        //     },
        //     markerEnd () {
        //         if (!this.mapInfo.coordinateEnd) return;
        //         const {coordinateEnd} = this.mapInfo;
        //         return L.latLng(coordinateEnd.latitude, coordinateEnd.longitude);
        //     }
        // }
    }

</script>
