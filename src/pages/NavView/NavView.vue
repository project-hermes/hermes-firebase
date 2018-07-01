<template>
  <div
    class="app__view">
    <NavBar
      v-if="isAuthorized"
      :show-toggle="showToggle"/>
    <router-view/>
  </div>
</template>

<script>
import {NavBar} from '~/components';
import {mapGetters} from 'vuex';

export default {
    components: {
        NavBar
    },
    data() {
        return {
            showToggle: false
        };
    },
    computed: {
        ...mapGetters({
            isAuthorized: 'auth/isAuthorized'
        })
    },
    watchers: {
        $route: {
            immediate: true,
            handler() {
                this.checkRoutes();
            }
        }
    },
    mounted() {
        this.checkRoutes();
    },
    methods: {
        checkRoutes() {
            // TODO: this sucks
            this.showToggle = this.$route.path === '/dives';
        }
    }
};
</script>

<style lang="scss">
@import 'bulma/bulma.sass';
body {
    margin: 0;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    -webkit-overflow-scrolling: touch;
}

body,
html,
#app,
.app__view {
    height: 100%;
}
</style>
